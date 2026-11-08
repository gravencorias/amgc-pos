import { useSyncExternalStore } from "react";
import { TouchModeEnum } from "../../enums/device.enum";
import { useDeviceStore } from "../../stores/common/device.store";

// A finger is the main pointer: tablets and phones. A touchscreen laptop used with a mouse
// still reports "fine", which is why the device setting can force touch mode on.
const coarseQuery = "(pointer: coarse)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(coarseQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

export const useCoarsePointer = () => useSyncExternalStore(subscribe, () => window.matchMedia(coarseQuery).matches);

// TOUCH MODE - bigger tap targets, no keyboard hints, an on-screen number pad for cash, and no
// search box grabbing focus (which would pop up the on-screen keyboard). On a PC nothing changes.
// app.hook mirrors it on <html data-touch="true"> for the Sass rules (_touch.scss) and for
// isTouchMode() in code that isn't a component.
const useTouchMode = () => {
  const touchMode = useDeviceStore((state) => state.touchMode);
  const coarse = useCoarsePointer();
  return touchMode === TouchModeEnum.on || (touchMode === TouchModeEnum.auto && coarse);
};

export default useTouchMode;
