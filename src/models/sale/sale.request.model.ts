import type { DiscountKindEnum, OrderTypeEnum, PaymentMethodEnum } from "../../enums/sale.enum";
import type { IPaginationRequest } from "../common/pagination";

// GET sale: one day's receipts. `date` is a Philippine calendar day, YYYY-MM-DD.
export interface ISaleTableRequest extends IPaginationRequest {
  date: string;
  paymentMethod?: PaymentMethodEnum;
  sort?: string;
}

// Lines carry no prices: amgc-pos-api prices every line from the menu itself.
export interface ISaleLineRequest {
  productId: number;
  sizeName: string | null;
  addOnIds: number[];
  note: string | null;
  qty: number;
}

export interface ISaleDiscountRequest {
  kind: DiscountKindEnum;
  name: string;
  idNumber: string;
}

export interface ISalePaymentRequest {
  method: PaymentMethodEnum;
  tendered: number;
  reference: string | null;
}

export interface ISaleRequest {
  orderType: OrderTypeEnum;
  tableNo: string | null;
  lines: ISaleLineRequest[];
  discount: ISaleDiscountRequest | null;
  payment: ISalePaymentRequest;
}

// POST sale/void. `approver` is an owner's or manager's sign-in, needed only when a
// cashier voids; an owner or manager approves their own void.
export interface ISaleVoidRequest {
  id: number;
  reason: string;
  approver: { username: string; password: string } | null;
}

export interface ISaleVoidFormValues {
  reason: string;
  approverUsername?: string;
  approverPassword?: string;
}

// The size / add-ons / note picker shown when a product has choices.
export interface IRegisterOptionsFormValues {
  sizeName?: string;
  addOnIds: number[];
  notes: string[];
  otherNote?: string;
  qty: number;
}

export interface IRegisterPaymentFormValues {
  method: PaymentMethodEnum;
  tendered?: number;
  reference?: string;
}
