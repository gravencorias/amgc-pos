// String values are what amgc-pos-api stores for closings; keep them in step with the API.

// A reopened Z reading stays on record but no longer closes its day.
export enum DayCloseStatusEnum {
  closed = "closed",
  reopened = "reopened",
}
