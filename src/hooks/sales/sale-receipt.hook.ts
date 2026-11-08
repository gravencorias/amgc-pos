import { useRef } from "react";
import { useModalStore } from "../../stores/common/modal.store";
import { useSalesStore } from "../../stores/data/sales.store";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { useReceiptPrint } from "../printer/receipt-printer.hook";
import { saleReceiptBytes } from "../../utils/escpos";

// A past receipt, opened from the Sales list, with reprint.
export const useSaleReceiptHook = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStore();
  const { viewingSale, setViewingSale } = useSalesStore();
  const { data: settings } = useStoreSettingsQuery();

  const { print, isPrinting, printerName } = useReceiptPrint({
    contentRef: receiptRef,
    documentTitle: viewingSale ? `Receipt ${viewingSale.receiptNumber} (reprint)` : "Receipt",
    receiptWidth: settings?.receiptWidth,
    buildBytes: () => (viewingSale ? saleReceiptBytes(viewingSale, settings) : null),
  });

  return {
    receiptRef,
    sale: viewingSale,
    settings,
    print,
    isPrinting,
    printerName,
    handleClose: () => {
      setViewingSale(null);
      closeModal();
    },
  };
};
