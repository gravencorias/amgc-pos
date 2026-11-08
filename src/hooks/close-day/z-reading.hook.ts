import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useModalStore } from "../../stores/common/modal.store";
import { useCloseDayStore } from "../../stores/data/close-day.store";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { receiptPageStyle } from "../../utils/receipt.util";

// A Z reading in the modal, just after closing or from the past closings list, with print.
export const useZReadingHook = () => {
  const zReadingRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStore();
  const { viewingClose, setViewingClose } = useCloseDayStore();
  const { data: settings } = useStoreSettingsQuery();

  const print = useReactToPrint({
    contentRef: zReadingRef,
    pageStyle: receiptPageStyle(settings?.receiptWidth),
    documentTitle: viewingClose ? `Z reading ${viewingClose.zNumber}` : "Z reading",
  });

  return {
    zReadingRef,
    dayClose: viewingClose,
    settings,
    print,
    handleClose: () => {
      setViewingClose(null);
      closeModal();
    },
  };
};
