import { useRef } from "react";
import { useModalStore } from "../../stores/common/modal.store";
import { useCloseDayStore } from "../../stores/data/close-day.store";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { useReceiptPrint } from "../printer/receipt-printer.hook";
import { zReadingBytes } from "../../utils/escpos";

// A Z reading in the modal, just after closing or from the past closings list, with print.
export const useZReadingHook = () => {
  const zReadingRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStore();
  const { viewingClose, setViewingClose } = useCloseDayStore();
  const { data: settings } = useStoreSettingsQuery();

  const { print, isPrinting, printerName } = useReceiptPrint({
    contentRef: zReadingRef,
    documentTitle: viewingClose ? `Z reading ${viewingClose.zNumber}` : "Z reading",
    receiptWidth: settings?.receiptWidth,
    buildBytes: () => (viewingClose ? zReadingBytes(viewingClose, settings) : null),
  });

  return {
    zReadingRef,
    dayClose: viewingClose,
    settings,
    print,
    isPrinting,
    printerName,
    handleClose: () => {
      setViewingClose(null);
      closeModal();
    },
  };
};
