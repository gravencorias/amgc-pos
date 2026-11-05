// String values are what amgc-pos-api stores for sales; keep them in step with the API.

export enum OrderTypeEnum {
  dineIn = "dine_in",
  takeOut = "take_out",
}

export const orderTypeLabel: Record<OrderTypeEnum, string> = {
  [OrderTypeEnum.dineIn]: "Dine-in",
  [OrderTypeEnum.takeOut]: "Take-out",
};

export enum PaymentMethodEnum {
  cash = "cash",
  ewallet = "ewallet",
  card = "card",
}

export const paymentMethodLabel: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.cash]: "Cash",
  [PaymentMethodEnum.ewallet]: "GCash or Maya",
  [PaymentMethodEnum.card]: "Card",
};

export enum DiscountKindEnum {
  seniorCitizen = "sc",
  pwd = "pwd",
}

export const discountKindLabel: Record<DiscountKindEnum, string> = {
  [DiscountKindEnum.seniorCitizen]: "Senior citizen",
  [DiscountKindEnum.pwd]: "Person with disability",
};

export const discountKindShort: Record<DiscountKindEnum, string> = {
  [DiscountKindEnum.seniorCitizen]: "SC",
  [DiscountKindEnum.pwd]: "PWD",
};
