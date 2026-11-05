import type { DayCloseStatusEnum } from "../../enums/day-close.enum";
import type { PaymentMethodEnum } from "../../enums/sale.enum";

// One Philippine calendar day's figures, as the Z reading prints them. Voided sales are
// left out of every figure except voidCount and voidTotal.
export interface IDayFigures {
  // The day's receipt numbers, first to last, voided ones included.
  firstReceipt: string | null;
  lastReceipt: string | null;
  saleCount: number;
  // Before senior citizen and PWD discounts (the sum of each sale's totals.gross).
  grossSales: number;
  discountCount: number;
  // VAT removed plus the 20%.
  discountTotal: number;
  // What customers paid: the sum of each sale's totals.total.
  netSales: number;
  vatableSales: number;
  vat: number;
  vatExemptSales: number;
  voidCount: number;
  voidTotal: number;
  cashSales: number;
  byPayment: { method: PaymentMethodEnum; count: number; total: number }[];
}

// A closed day: the Z reading. zNumber counts up from 0001, and the grand total carries
// over from one closing to the next (BIR's accumulated grand total).
export interface IDayCloseResponse {
  id: number;
  zNumber: string;
  date: string;
  closedAt: string;
  closedByName: string;
  figures: IDayFigures;
  openingFloat: number;
  cashCount: { denomination: number; qty: number }[];
  // openingFloat + figures.cashSales
  expectedCash: number;
  countedCash: number;
  // countedCash − expectedCash: positive is over, negative is short.
  overShort: number;
  note: string | null;
  grandTotalBefore: number;
  grandTotalAfter: number;
  status: DayCloseStatusEnum;
  // Set when the owner reopened the day, for a closing made by mistake.
  reopenInfo: { reason: string; reopenedAt: string; reopenedByName: string } | null;
}

// GET day-close/today: whether today is closed. Everyone signed in can read it, so the
// Register can stop taking sales once the Z reading is done.
export interface IDayCloseTodayResponse {
  date: string;
  isClosed: boolean;
  zNumber: string | null;
  closedAt: string | null;
  closedByName: string | null;
}

// GET day-close/current: the day due to be closed. That's the oldest earlier day with
// sales that wasn't closed, otherwise today. `close` is set once it's closed.
export interface IDayCloseCurrentResponse {
  date: string;
  isToday: boolean;
  close: IDayCloseResponse | null;
  figures: IDayFigures;
  // The last closing's starting cash, to prefill the form.
  suggestedFloat: number;
  // The newest closing still in force: the only one the owner can reopen.
  latestCloseId: number | null;
}
