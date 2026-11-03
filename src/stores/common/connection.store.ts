import { create } from "zustand";

// The API answered, but with the gateway's or the server's "not now":
// 502/504 (a service behind it failed) or 503 (unavailable - maintenance, load).
export type ServiceDownStatus = 502 | 503;

// Which offline screen: no network at all, a network but no answer, or an
// answer that says the service is down (the 502 and 503 pages).
export type OfflineReason = "network" | "server" | ServiceDownStatus;

// IS THE APP CONNECTED - written by the HTTP client (utils/http_service.ts) on
// every response, read by the offline screen (common/status/OfflineScreen.tsx).
// Ported from dcwd_erp-hr-attendance's MobX ConnectionStore.
type States = {
  // navigator.onLine, kept current by the online/offline events.
  browserOnline: boolean;
  // A request got no answer at all - the API is down or out of reach.
  serverUnreachable: boolean;
  serviceDown: ServiceDownStatus | null;
  // When the API last answered properly, for "Last connected today at 10:42 AM".
  lastConnectedAt: number | null;
  // The offline screen's "Try again" is checking the API.
  isChecking: boolean;
};

type Actions = {
  setBrowserOnline: (online: boolean) => void;
  markReachable: () => void;
  markUnreachable: () => void;
  markServiceDown: (status: ServiceDownStatus) => void;
  setIsChecking: (isChecking: boolean) => void;
};

export const useConnectionStore = create<States & Actions>()((set) => ({
  browserOnline: typeof navigator === "undefined" ? true : navigator.onLine,
  serverUnreachable: false,
  serviceDown: null,
  lastConnectedAt: null,
  isChecking: false,
  setBrowserOnline: (browserOnline) => set({ browserOnline }),
  markReachable: () =>
    set({
      serverUnreachable: false,
      serviceDown: null,
      lastConnectedAt: Date.now(),
    }),
  markUnreachable: () => set({ serverUnreachable: true }),
  markServiceDown: (serviceDown) =>
    set({ serverUnreachable: false, serviceDown }),
  setIsChecking: (isChecking) => set({ isChecking }),
}));

// The getters of attendance's store, as selectors.
export const selectOfflineReason = (state: States): OfflineReason | null => {
  if (!state.browserOnline) return "network";
  if (state.serverUnreachable) return "server";
  return state.serviceDown;
};
