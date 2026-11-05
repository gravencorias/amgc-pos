import { create } from "zustand";

export type LoginMethod = "pin" | "password";

export const PIN_MAX_LENGTH = 6;

type States = {
  method: LoginMethod;
  pin: string;
  pinRejected: boolean;
  // The floor lamp in the sign-in illustration.
  lampOn: boolean;
};

type Actions = {
  setMethod: (method: LoginMethod) => void;
  pressDigit: (digit: string) => void;
  backspace: () => void;
  clearPin: () => void;
  setPinRejected: (pinRejected: boolean) => void;
  toggleLamp: () => void;
};

const initialValues: States = {
  method: "pin",
  pin: "",
  pinRejected: false,
  lampOn: true,
};

export const useLoginStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setMethod: (method) => set({ method, pin: "", pinRejected: false }),
  pressDigit: (digit) =>
    set((state) => (state.pin.length >= PIN_MAX_LENGTH ? state : { pin: state.pin + digit, pinRejected: false })),
  backspace: () => set((state) => ({ pin: state.pin.slice(0, -1), pinRejected: false })),
  clearPin: () => set({ pin: "", pinRejected: false }),
  setPinRejected: (pinRejected) => set({ pinRejected }),
  toggleLamp: () => set((state) => ({ lampOn: !state.lampOn })),
}));
