import { RECEIPT_DISCLAIMER } from "../constants/constantReceipt";
import { denominationLabel } from "../constants/constantCash";
import { ReceiptWidthEnum } from "../enums/receipt.enum";
import {
  discountKindLabel,
  discountKindShort,
  orderTypeLabel,
  PaymentMethodEnum,
  paymentMethodLabel,
  SaleStatusEnum,
} from "../enums/sale.enum";
import type { IDayCloseResponse } from "../models/day-close/day-close.response.model";
import type { ISaleResponse } from "../models/sale/sale.response.model";
import type { IStoreSettingsResponse } from "../models/store-settings/store-settings.response.model";

// ESC/POS: the raw commands Bluetooth receipt printers take (the Android app sends them through
// ReceiptPrinterPlugin). These mirror SaleReceipt and ZReading line for line, so a Bluetooth
// receipt reads like the on-screen one. The logo isn't printed: raster images vary too much
// between cheap printers.

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

// Characters per line in the printer's standard font: 58 mm paper fits 32, 80 mm fits 48.
export const lineWidth = (width?: ReceiptWidthEnum) => (width === ReceiptWidthEnum.mm58 ? 32 : 48);

// Code page 437, the printers' default, has the Spanish letters Filipino names use; everything
// else is spelled out or simplified. The peso sign isn't in it, so amounts print as "P120.00".
const CP437: Record<string, number> = {
  "é": 0x82, "á": 0xa0, "í": 0xa1, "ó": 0xa2, "ú": 0xa3, "ñ": 0xa4, "Ñ": 0xa5, "ü": 0x81, "Ü": 0x9a, "É": 0x90,
};
const REPLACE: Record<string, string> = { "₱": "P", "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "…": "...", "·": "-" };

const encode = (text: string): number[] => {
  const out: number[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code < 0x7f) out.push(code);
    else if (CP437[ch] !== undefined) out.push(CP437[ch]);
    else if (REPLACE[ch] !== undefined) out.push(...encode(REPLACE[ch]));
    else {
      // Accented letters lose the accent ("ç" -> "c"); anything else becomes "?".
      const plain = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (plain !== ch && plain.length > 0) out.push(...encode(plain));
      else out.push(0x3f);
    }
  }
  return out;
};

// Word-wraps to the line width; a word longer than a line is cut.
const wrap = (text: string, width: number): string[] => {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!current) current = word;
    else if (current.length + 1 + word.length <= width) current += ` ${word}`;
    else {
      lines.push(current);
      current = word;
    }
    while (current.length > width) {
      lines.push(current.slice(0, width));
      current = current.slice(width);
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

class ReceiptBuilder {
  private bytes: number[] = [];
  readonly width: number;

  constructor(width: number) {
    this.width = width;
    // Reset the printer, then code page 437.
    this.bytes.push(ESC, 0x40, ESC, 0x74, 0x00);
  }

  private raw(...values: number[]) {
    this.bytes.push(...values);
    return this;
  }

  align(where: "left" | "center") {
    return this.raw(ESC, 0x61, where === "center" ? 1 : 0);
  }

  bold(on: boolean) {
    return this.raw(ESC, 0x45, on ? 1 : 0);
  }

  // Double height only, so a line still fits the same number of characters.
  tall(on: boolean) {
    return this.raw(GS, 0x21, on ? 0x01 : 0x00);
  }

  text(value: string) {
    for (const line of wrap(value, this.width)) this.raw(...encode(line), LF);
    return this;
  }

  center(value: string, options: { bold?: boolean; tall?: boolean } = {}) {
    this.align("center");
    if (options.bold) this.bold(true);
    if (options.tall) this.tall(true);
    this.text(value);
    if (options.tall) this.tall(false);
    if (options.bold) this.bold(false);
    return this.align("left");
  }

  // Label on the left, value on the right. A label too long for the line wraps above the value.
  row(label: string, value: string, options: { bold?: boolean } = {}) {
    if (options.bold) this.bold(true);
    const room = this.width - value.length - 1;
    if (label.length <= room) {
      this.raw(...encode(label + " ".repeat(this.width - label.length - value.length) + value), LF);
    } else {
      const lines = wrap(label, Math.max(room, 8));
      lines.slice(0, -1).forEach((line) => this.raw(...encode(line), LF));
      const last = lines[lines.length - 1];
      this.raw(...encode(last + " ".repeat(Math.max(1, this.width - last.length - value.length)) + value), LF);
    }
    if (options.bold) this.bold(false);
    return this;
  }

  rule() {
    return this.raw(...encode("-".repeat(this.width)), LF);
  }

  // Feeds the paper past the tear bar, then cuts where the printer has a cutter (others ignore it).
  finish() {
    return this.raw(ESC, 0x64, 4, GS, 0x56, 0x42, 0x00);
  }

  toBytes() {
    return Uint8Array.from(this.bytes);
  }
}

const money = (value: number) => value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pesos = (value: number) => `P${money(value)}`;
const date = (value: Date) => value.toLocaleDateString("en-PH");
const time = (value: Date) => value.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });

const storeHeader = (r: ReceiptBuilder, settings: IStoreSettingsResponse | undefined, withTagline: boolean) => {
  r.center((settings?.storeName ?? "Store").toUpperCase(), { bold: true, tall: true });
  if (withTagline && settings?.tagline) r.center(settings.tagline);
  if (settings?.address) r.center(settings.address);
  if (settings?.tin) r.center(`${settings.vatRegistered ? "VAT Reg." : "Non-VAT Reg."} TIN ${settings.tin}`);
  r.rule();
};

// A sale's receipt, the same as SaleReceipt.
export const saleReceiptBytes = (sale: ISaleResponse, settings: IStoreSettingsResponse | undefined) => {
  const r = new ReceiptBuilder(lineWidth(settings?.receiptWidth));
  const t = sale.totals;
  const when = new Date(sale.createdAt);
  const voidInfo = sale.status === SaleStatusEnum.voided ? sale.voidInfo : null;

  storeHeader(r, settings, true);
  if (voidInfo) r.center("*** VOID ***", { bold: true });
  r.row("Receipt no.", sale.receiptNumber);
  r.row(`Order ${sale.orderNumber}`, `${orderTypeLabel[sale.orderType]}${sale.tableNo ? `, table ${sale.tableNo}` : ""}`);
  r.row(date(when), time(when));
  r.row("Cashier", sale.cashierName);
  r.rule();

  for (const l of sale.lines) {
    r.row(`${l.qty} x ${l.name}`, money(l.lineTotal));
    const details = [l.sizeName, ...l.addOns.map((a) => a.name), l.note ? `"${l.note}"` : null].filter(Boolean).join(", ");
    if (details) r.text(`  ${details}`);
  }
  r.rule();

  r.row("Subtotal", money(t.gross));
  if (sale.discount) {
    if (t.vatExemptAmount > 0) r.row("Less VAT 12%", `-${money(t.vatExemptAmount)}`);
    r.row(`Less ${discountKindShort[sale.discount.kind]} disc. 20%`, `-${money(t.discountAmount)}`);
  }
  r.tall(true).row("TOTAL", pesos(t.total), { bold: true }).tall(false);
  r.row(paymentMethodLabel[sale.payment.method], money(sale.payment.tendered));
  if (sale.payment.method === PaymentMethodEnum.cash) r.row("Change", money(sale.payment.change));
  if (sale.payment.reference) r.row("Ref. no.", sale.payment.reference);

  if (settings?.vatRegistered !== false) {
    r.rule();
    r.row("VATable sales", money(t.vatableSales));
    r.row("VAT-exempt sales", money(t.vatExemptSales));
    r.row("VAT 12%", money(t.vat));
  }

  if (sale.discount) {
    r.rule();
    r.text(`${discountKindLabel[sale.discount.kind]}: ${sale.discount.name}`);
    r.text(`ID no.: ${sale.discount.idNumber}`);
    r.text("Signature: ________________");
  }

  if (voidInfo) {
    const voidedAt = new Date(voidInfo.voidedAt);
    r.rule();
    r.center("VOIDED. NOT A SALE.", { bold: true });
    r.row("Voided", `${date(voidedAt)} ${time(voidedAt)}`);
    r.row("By", voidInfo.voidedByName);
    if (voidInfo.approvedByName !== voidInfo.voidedByName) r.row("Approved by", voidInfo.approvedByName);
    r.text(`Reason: ${voidInfo.reason}`);
  }

  r.rule();
  if (settings?.receiptFooter) r.center(settings.receiptFooter);
  r.center(RECEIPT_DISCLAIMER);
  return r.finish().toBytes();
};

// A Z reading, the same as ZReading.
export const zReadingBytes = (z: IDayCloseResponse, settings: IStoreSettingsResponse | undefined) => {
  const r = new ReceiptBuilder(lineWidth(settings?.receiptWidth));
  const f = z.figures;
  const closedAt = new Date(z.closedAt);
  const day = new Date(`${z.date}T00:00:00`);

  storeHeader(r, settings, false);
  r.center("Z READING", { bold: true });
  if (z.reopenInfo) r.center("*** REOPENED ***", { bold: true });
  r.row("Z no.", z.zNumber);
  r.row("Business day", date(day));
  r.row("Closed", `${date(closedAt)} ${time(closedAt)}`);
  r.row("Closed by", z.closedByName);
  r.row("Receipts", f.firstReceipt ? `${f.firstReceipt}-${f.lastReceipt}` : "None");
  r.rule();

  r.row("Sales", String(f.saleCount));
  r.row("Gross sales", money(f.grossSales));
  r.row(`Less SC/PWD (${f.discountCount})`, `-${money(f.discountTotal)}`);
  r.row("NET SALES", money(f.netSales), { bold: true });

  if (settings?.vatRegistered !== false) {
    r.rule();
    r.row("VATable sales", money(f.vatableSales));
    r.row("VAT 12%", money(f.vat));
    r.row("VAT-exempt sales", money(f.vatExemptSales));
  }

  r.rule();
  r.row(`Voided (${f.voidCount})`, money(f.voidTotal));
  for (const p of f.byPayment) r.row(`${paymentMethodLabel[p.method]} (${p.count})`, money(p.total));
  r.rule();

  r.center("CASH COUNT");
  for (const c of z.cashCount) r.row(`${denominationLabel(c.denomination)} x ${c.qty}`, money(c.denomination * c.qty));
  r.row("Starting cash", money(z.openingFloat));
  r.row("Cash sales", money(f.cashSales));
  r.row("Expected", money(z.expectedCash));
  r.row("Counted", money(z.countedCash));
  r.row(z.overShort === 0 ? "BALANCED" : z.overShort > 0 ? "OVER" : "SHORT", money(Math.abs(z.overShort)), { bold: true });
  if (z.note) r.text(`Note: ${z.note}`);
  r.rule();

  r.row("Old grand total", money(z.grandTotalBefore));
  r.row("New grand total", money(z.grandTotalAfter));

  if (z.reopenInfo) {
    const reopenedAt = new Date(z.reopenInfo.reopenedAt);
    r.rule();
    r.center("REOPENED. NOT IN FORCE.", { bold: true });
    r.row("Reopened", `${date(reopenedAt)} ${time(reopenedAt)}`);
    r.row("By", z.reopenInfo.reopenedByName);
    r.text(`Reason: ${z.reopenInfo.reason}`);
  }

  r.rule();
  r.center(RECEIPT_DISCLAIMER);
  return r.finish().toBytes();
};

// Settings > Devices' test print: shows the line width, so a wrong paper setting is obvious.
export const testPageBytes = (settings: IStoreSettingsResponse | undefined, printerName: string) => {
  const r = new ReceiptBuilder(lineWidth(settings?.receiptWidth));
  r.center((settings?.storeName ?? "AMGC POS").toUpperCase(), { bold: true, tall: true });
  r.center("Printer test");
  r.rule();
  r.row("Printer", printerName);
  r.row("Paper", settings?.receiptWidth === ReceiptWidthEnum.mm58 ? "58 mm" : "80 mm");
  r.row("Printed", `${date(new Date())} ${time(new Date())}`);
  r.rule();
  r.text("1234567890".repeat(Math.ceil(r.width / 10)).slice(0, r.width));
  r.text("The line of numbers above should fill one line exactly. If it wraps or stops short, change Receipt paper in Store details.");
  return r.finish().toBytes();
};

// Opens a cash drawer plugged into the printer (the RJ11 "DK" port): pin 2, a 50 ms pulse.
export const cashDrawerBytes = () => Uint8Array.from([ESC, 0x70, 0x00, 0x19, 0xfa]);
