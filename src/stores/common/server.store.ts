import { create } from "zustand";
import { applyServerUrl, readSavedServer, SERVER_URL_KEY } from "../../utils/server.util";

// The Android app's store server (see utils/server.util.ts). Unused in a browser.
type States = {
  // "http://192.168.1.10:5000", or null before the Connect screen has saved one.
  serverUrl: string | null;
  // "Change server" on the sign-in screen opens the Connect screen over a saved address.
  isChanging: boolean;
};

type Actions = {
  saveServerUrl: (serverUrl: string) => void;
  startChange: () => void;
  cancelChange: () => void;
};

export const useServerStore = create<States & Actions>()((set) => ({
  serverUrl: readSavedServer(),
  isChanging: false,
  saveServerUrl: (serverUrl) => {
    try {
      window.localStorage.setItem(SERVER_URL_KEY, serverUrl);
    } catch {
      // Storage blocked: it still works until the app restarts.
    }
    applyServerUrl(serverUrl);
    set({ serverUrl, isChanging: false });
  },
  startChange: () => set({ isChanging: true }),
  cancelChange: () => set({ isChanging: false }),
}));
