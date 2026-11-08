import { useEffect, useRef } from "react";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { focusRegisterSearch } from "../../utils/sale.util";
import { useReceiptPrint } from "../printer/receipt-printer.hook";
import { saleReceiptBytes } from "../../utils/escpos";

export const useReceiptHook = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { closeModal } = useModalStore();
  const lastSale = useRegisterStore((state) => state.lastSale);
  const { data: settings } = useStoreSettingsQuery();

  const { print, isPrinting, printerName } = useReceiptPrint({
    contentRef: receiptRef,
    documentTitle: lastSale ? `Receipt ${lastSale.receiptNumber}` : "Receipt",
    receiptWidth: settings?.receiptWidth,
    buildBytes: () => (lastSale ? saleReceiptBytes(lastSale, settings) : null),
  });

  const startNextOrder = () => {
    closeModal();
    focusRegisterSearch();
  };

  // Enter starts the next order straight from the receipt.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || (e.target as HTMLElement | null)?.closest("button")) return;
      e.preventDefault();
      startNextOrder();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return { receiptRef, lastSale, settings, print, isPrinting, printerName, startNextOrder };
};
