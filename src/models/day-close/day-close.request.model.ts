import type { IPaginationRequest } from "../common/pagination";

// POST day-close/create. `date` must be the day GET day-close/current returned.
export interface IDayCloseRequest {
  date: string;
  openingFloat: number;
  cashCount: { denomination: number; qty: number }[];
  note: string | null;
}

export type IDayCloseTableRequest = IPaginationRequest;

// POST day-close/reopen. Owner only, for the latest closing still in force.
export interface IDayReopenRequest {
  id: number;
  reason: string;
}

export interface IDayReopenFormValues {
  reason: string;
}

// The cash count form. `counts` is keyed by denomination ("1000", "0.25"), holding how
// many of each are in the drawer.
export interface IDayCloseFormValues {
  openingFloat: number | null;
  counts: Record<string, number | null>;
  note?: string;
}
