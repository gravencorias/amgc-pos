import { useSyncExternalStore } from "react";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl";

const getBreakPoint = (windowWidth: number): Breakpoint => {
  if (windowWidth < 767) return "sm";
  else if (windowWidth < 991) return "md";
  else if (windowWidth < 1199) return "lg";
  else if (windowWidth < 1440) return "xl";
  else if (windowWidth <= 2560) return "xxl";
  return "xxxl";
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};

// Same breakpoints as payroll's hook, read with useSyncExternalStore instead of useState.
const useWindowSize = () => useSyncExternalStore(subscribe, () => getBreakPoint(window.innerWidth));

export default useWindowSize;
