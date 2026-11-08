import { create } from "zustand";

// The Android app's Bluetooth receipt printer. It belongs to this tablet, not the store, so it's
// saved on the device (like touch mode). Unused in a browser, which prints with the print dialog.
const PRINTER_KEY = "amgc_receipt_printer";
const DRAWER_KEY = "amgc_open_cash_drawer";

export type IReceiptPrinter = { name: string; address: string };

const read = <T,>(key: string, fallback: T): T => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: the choice still applies until the app restarts.
  }
};

type States = {
  printer: IReceiptPrinter | null;
  // Open the cash drawer (plugged into the printer) when a cash sale completes.
  openDrawer: boolean;
};

type Actions = {
  setPrinter: (printer: IReceiptPrinter | null) => void;
  setOpenDrawer: (openDrawer: boolean) => void;
};

export const usePrinterStore = create<States & Actions>()((set) => ({
  printer: read<IReceiptPrinter | null>(PRINTER_KEY, null),
  openDrawer: read<boolean>(DRAWER_KEY, false),
  setPrinter: (printer) => {
    write(PRINTER_KEY, printer);
    set({ printer });
  },
  setOpenDrawer: (openDrawer) => {
    write(DRAWER_KEY, openDrawer);
    set({ openDrawer });
  },
}));
