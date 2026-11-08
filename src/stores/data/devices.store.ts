import { create } from "zustand";

type States = {
  // The address the QR code shows, when the server PC has more than one (Wi-Fi and cable).
  // null means the first one.
  selectedAddress: string | null;
};

type Actions = {
  setSelectedAddress: (selectedAddress: string) => void;
};

export const useDevicesStore = create<States & Actions>()((set) => ({
  selectedAddress: null,
  setSelectedAddress: (selectedAddress) => set({ selectedAddress }),
}));
