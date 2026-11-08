import { QUICK_CASH_STEPS } from "../constants/constantReceipt";
import type { ICartLine } from "../models/register/register.model";
import type { ISaleTotals } from "../models/sale/sale.response.model";
import { isTouchMode } from "./touch.util";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Same product, size, add-ons and note = the same line (its quantity goes up).
export const cartLineKey = (productId: number, sizeName: string | null, addOnIds: number[], note: string | null) =>
  [productId, sizeName ?? "", [...addOnIds].sort((a, b) => a - b).join(","), note ?? ""].join("|");

export const cartGross = (lines: ICartLine[]) => round2(lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0));

// Philippine rules. Menu prices include 12% VAT. A senior citizen or PWD sale is
// VAT-exempt and gets 20% off the VAT-exempt amount. A store that isn't VAT-registered
// charges no VAT, so the 20% comes off the plain amount. amgc-pos-api (and the mock)
// compute the same; the server's figures are what the receipt prints.
export const computeSaleTotals = (gross: number, hasDiscount: boolean, vatRegistered: boolean): ISaleTotals => {
  if (!vatRegistered) {
    const discountAmount = hasDiscount ? round2(gross * 0.2) : 0;
    const total = round2(gross - discountAmount);
    return { gross, vatExemptAmount: 0, discountAmount, total, vatableSales: 0, vat: 0, vatExemptSales: total };
  }
  if (hasDiscount) {
    const exempt = gross / 1.12;
    const total = round2(exempt * 0.8);
    return {
      gross,
      vatExemptAmount: round2(gross - exempt),
      discountAmount: round2(exempt * 0.2),
      total,
      vatableSales: 0,
      vat: 0,
      vatExemptSales: total,
    };
  }
  const vatable = gross / 1.12;
  return {
    gross,
    vatExemptAmount: 0,
    discountAmount: 0,
    total: gross,
    vatableSales: round2(vatable),
    vat: round2(gross - vatable),
    vatExemptSales: 0,
  };
};

// The exact amount, then the next round amounts above it: ₱335 → 350, 400, 500, 1000.
export const quickCashAmounts = (total: number) =>
  [...new Set(QUICK_CASH_STEPS.map((step) => Math.ceil(total / step) * step))].filter((v) => v > total).slice(0, 3);

// Back to the register's search after a dialog closes. Deferred because antd's Modal
// returns focus to whatever opened it as it closes, which would win otherwise.
// Not in touch mode, where it would pop up the on-screen keyboard after every sale.
export const focusRegisterSearch = () => {
  if (isTouchMode()) return;
  window.setTimeout(() => document.getElementById("register-search")?.focus({ preventScroll: true }), 150);
};

export const peso = (value: number) =>
  "₱" + value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
