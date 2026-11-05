import type { DiscountKindEnum, OrderTypeEnum, PaymentMethodEnum } from "../../enums/sale.enum";

export interface ISaleTotals {
  gross: number;
  // The VAT removed from a senior citizen or PWD sale.
  vatExemptAmount: number;
  discountAmount: number;
  total: number;
  vatableSales: number;
  vat: number;
  vatExemptSales: number;
}

export interface ISaleLineResponse {
  productId: number;
  name: string;
  sizeName: string | null;
  addOns: { id: number; name: string; price: number }[];
  note: string | null;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

// GET sale/summary: one Philippine calendar day.
export interface ISaleSummaryResponse {
  date: string;
  saleCount: number;
  // Sum of the sales' totals, after discounts.
  grossSales: number;
  averageSale: number;
  itemsSold: number;
  dineInCount: number;
  takeOutCount: number;
  discountCount: number;
  // VAT removed plus the 20%, across senior citizen and PWD sales.
  discountTotal: number;
  vatTotal: number;
  byHour: { hour: number; count: number; total: number }[];
  byPayment: { method: PaymentMethodEnum; count: number; total: number }[];
  topProducts: { name: string; qty: number; total: number }[];
}

export interface ISaleResponse {
  id: number;
  receiptNumber: string;
  orderNumber: string;
  createdAt: string;
  cashierId: number;
  cashierName: string;
  orderType: OrderTypeEnum;
  tableNo: string | null;
  lines: ISaleLineResponse[];
  discount: { kind: DiscountKindEnum; name: string; idNumber: string } | null;
  totals: ISaleTotals;
  payment: { method: PaymentMethodEnum; tendered: number; change: number; reference: string | null };
}
