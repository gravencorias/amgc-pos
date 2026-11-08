import { create } from "zustand";

// The store found at the address being tried, before the person confirms it.
export type IFoundStore = {
  serverUrl: string;
  storeName: string;
  logoUrl: string | null;
  // The server's package version, or null when it couldn't be read.
  version: string | null;
};

type States = {
  found: IFoundStore | null;
};

type Actions = {
  setFound: (found: IFoundStore | null) => void;
};

export const useConnectStore = create<States & Actions>()((set) => ({
  found: null,
  setFound: (found) => set({ found }),
}));
