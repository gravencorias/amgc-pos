import { useSyncExternalStore } from "react";
import { formatTime } from "../../utils/date.util";

// One shared one-second timer for every clock on screen. The snapshot is the formatted
// Philippine time ("3:42 PM"), so components only re-render when the minute changes.
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
};

const getTime = () => formatTime(new Date().toISOString());

const useClock = () => useSyncExternalStore(subscribe, getTime);

export default useClock;
