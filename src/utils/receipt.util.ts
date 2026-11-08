import { ReceiptWidthEnum } from "../enums/receipt.enum";

// react-to-print's page for the store's paper roll; the browser's print dialog sends it to the
// receipt printer. Unknown or not yet loaded means 80 mm.
export const receiptPageStyle = (width?: ReceiptWidthEnum) => {
  const is58 = width === ReceiptWidthEnum.mm58;
  return `
  @page { size: ${is58 ? "58mm" : "80mm"} auto; margin: ${is58 ? "2mm" : "3mm"}; }
  body { margin: 0; }
  .amgc-receipt { width: 100% !important; filter: none !important; -webkit-mask: none !important; mask: none !important; }
`;
};

// The extra class on .amgc-receipt for a 58 mm roll: narrower on screen and a size smaller.
export const receiptWidthClass = (width?: ReceiptWidthEnum) => (width === ReceiptWidthEnum.mm58 ? " is-58mm" : "");
