// The receipt printer's paper roll. The string values are what the API stores (store settings).
export enum ReceiptWidthEnum {
  // 48 characters a line: most counter printers.
  mm80 = "80mm",
  // 32 characters a line: small Bluetooth printers like the PT-210.
  mm58 = "58mm",
}

export const receiptWidthLabel: Record<ReceiptWidthEnum, string> = {
  [ReceiptWidthEnum.mm80]: "80 mm",
  [ReceiptWidthEnum.mm58]: "58 mm",
};
