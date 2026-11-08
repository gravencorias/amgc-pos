import { create } from "zustand";
import { TouchModeEnum } from "../../enums/device.enum";

// Settings that belong to this device rather than to the store or the person signed in:
// a tablet and the counter PC of the same store can differ. Saved in localStorage, like the
// branding cache in theme.store.
const TOUCH_MODE_KEY = "amgc_touch_mode";

const readTouchMode = (): TouchModeEnum => {
  try {
    const saved = window.localStorage.getItem(TOUCH_MODE_KEY);
    return Object.values(TouchModeEnum).includes(saved as TouchModeEnum) ? (saved as TouchModeEnum) : TouchModeEnum.auto;
  } catch {
    return TouchModeEnum.auto;
  }
};

type States = {
  touchMode: TouchModeEnum;
};

type Actions = {
  setTouchMode: (touchMode: TouchModeEnum) => void;
};

export const useDeviceStore = create<States & Actions>()((set) => ({
  touchMode: readTouchMode(),
  setTouchMode: (touchMode) => {
    try {
      window.localStorage.setItem(TOUCH_MODE_KEY, touchMode);
    } catch {
      // Storage blocked: the choice still applies until the page reloads.
    }
    set({ touchMode });
  },
}));
