import { registerPlugin } from "@capacitor/core";
import { usePrinterStore } from "../stores/common/printer.store";
import { cashDrawerBytes } from "./escpos";
import { isNativeApp } from "./native.util";

// The Android app's own plugin (android/app/src/main/java/com/amgc/pos/ReceiptPrinterPlugin.java).
export type IPairedDevice = { name: string; address: string; isPrinter: boolean };

interface ReceiptPrinterPlugin {
  listPrinters(): Promise<{ printers: IPairedDevice[] }>;
  print(options: { address: string; data: string }): Promise<void>;
}

export const ReceiptPrinter = registerPlugin<ReceiptPrinterPlugin>("ReceiptPrinter");

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

// Print goes to the Bluetooth printer only in the Android app with a printer chosen on
// Settings > Devices; otherwise the browser's print dialog (react-to-print) is used.
export const hasBluetoothPrinter = () => isNativeApp && !!usePrinterStore.getState().printer;

export const sendToPrinter = async (bytes: Uint8Array, address = usePrinterStore.getState().printer?.address) => {
  if (!address) throw new Error("Choose a receipt printer on Settings > Devices.");
  await ReceiptPrinter.print({ address, data: toBase64(bytes) });
};

// The plugin rejects with a message written for the cashier; anything else gets a general one.
export const printerErrorMessage = (error: unknown) =>
  (error as { message?: string } | null)?.message || "The receipt didn't print. Check the printer and try again.";

// After a cash sale: open the drawer through the printer when this tablet is set to. Quiet on
// failure apart from the returned promise, so the sale itself is never held up.
export const openCashDrawerAfterCashSale = () => {
  const { printer, openDrawer } = usePrinterStore.getState();
  if (!isNativeApp || !printer || !openDrawer) return Promise.resolve();
  return sendToPrinter(cashDrawerBytes(), printer.address);
};
