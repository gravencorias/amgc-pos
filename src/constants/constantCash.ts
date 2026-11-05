// Philippine cash a drawer holds, largest first, for the end-of-day count. ₱20 comes as
// both a bill and a coin; they're counted together.
export const CASH_DENOMINATIONS: { value: number; label: string }[] = [
  { value: 1000, label: "₱1,000" },
  { value: 500, label: "₱500" },
  { value: 200, label: "₱200" },
  { value: 100, label: "₱100" },
  { value: 50, label: "₱50" },
  { value: 20, label: "₱20" },
  { value: 10, label: "₱10" },
  { value: 5, label: "₱5" },
  { value: 1, label: "₱1" },
  { value: 0.25, label: "25¢" },
];

// Labels for a saved count, which can hold denominations the form doesn't list.
export const denominationLabel = (value: number) =>
  value >= 1 ? `₱${value.toLocaleString("en-PH")}` : `${Math.round(value * 100)}¢`;
