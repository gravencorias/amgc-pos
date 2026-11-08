import { useMutation } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import type { RefObject } from "react";
import { usePrinterStore } from "../../stores/common/printer.store";
import { isNativeApp } from "../../utils/native.util";
import { printerErrorMessage, sendToPrinter } from "../../utils/receipt-printer.util";
import { receiptPageStyle } from "../../utils/receipt.util";
import { Toast } from "../../utils/http_service";
import type { ReceiptWidthEnum } from "../../enums/receipt.enum";

type Options = {
  // What the browser prints (the on-screen receipt).
  contentRef: RefObject<HTMLDivElement | null>;
  documentTitle: string;
  receiptWidth?: ReceiptWidthEnum;
  // What the Bluetooth printer prints: the same receipt as ESC/POS (utils/escpos.ts).
  buildBytes: () => Uint8Array | null;
};

// ONE PRINT BUTTON, TWO PRINTERS. In the Android app with a printer chosen on Settings > Devices,
// the receipt goes straight to the Bluetooth printer; otherwise the browser's print dialog opens,
// as on every PC. Used by the receipt after Charge, a reprint from Sales and a Z reading.
export const useReceiptPrint = ({ contentRef, documentTitle, receiptWidth, buildBytes }: Options) => {
  const printer = usePrinterStore((state) => state.printer);

  const browserPrint = useReactToPrint({ contentRef, documentTitle, pageStyle: receiptPageStyle(receiptWidth) });

  const bluetoothMutation = useMutation({
    mutationFn: sendToPrinter,
    onError: (error) => Toast.fire({ icon: "error", title: printerErrorMessage(error) }),
  });

  const print = () => {
    if (isNativeApp && printer) {
      const bytes = buildBytes();
      if (bytes) bluetoothMutation.mutate(bytes);
      return;
    }
    browserPrint();
  };

  return { print, isPrinting: bluetoothMutation.isLoading, printerName: isNativeApp ? printer?.name : undefined };
};
