import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useModalStore } from "../../stores/common/modal.store";
import { useSalesStore } from "../../stores/data/sales.store";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { receiptPageStyle } from "../../utils/receipt.util";

// A past receipt, opened from the Sales list, with reprint.
export const useSaleReceiptHook = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStore();
  const { viewingSale, setViewingSale } = useSalesStore();
  const { data: settings } = useStoreSettingsQuery();

  const print = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: receiptPageStyle(settings?.receiptWidth),
    documentTitle: viewingSale ? `Receipt ${viewingSale.receiptNumber} (reprint)` : "Receipt",
  });

  return {
    receiptRef,
    sale: viewingSale,
    settings,
    print,
    handleClose: () => {
      setViewingSale(null);
      closeModal();
    },
  };
};
