import dayjs from "dayjs";

// The store's day is a Philippine calendar day (UTC+8, no daylight saving), whatever
// time zone the computer is set to. YYYY-MM-DD, as the API expects.
const PH_OFFSET_MINUTES = 8 * 60;

export const phToday = () => dayjs().add(PH_OFFSET_MINUTES + dayjs().utcOffset() * -1, "minute").format("YYYY-MM-DD");

export const shiftDate = (date: string, days: number) => dayjs(date).add(days, "day").format("YYYY-MM-DD");

export const formatLongDate = (date: string) =>
  dayjs(date).toDate().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export const hourLabel = (hour: number) =>
  hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
