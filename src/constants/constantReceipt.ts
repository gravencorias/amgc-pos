import { CategoryIconEnum } from "../enums/product.enum";

// Printed at the bottom of every receipt until the store's POS is BIR-accredited and
// has a Permit to Use. Replace it (and add the PTU details) at that point.
export const RECEIPT_DISCLAIMER = "This is not an official receipt.";

// One-tap notes in the size / add-on picker, by the product's category picture.
export const NOTE_PRESETS: Record<CategoryIconEnum, string[]> = {
  [CategoryIconEnum.hot]: ["Less sweet", "No sugar", "Extra hot"],
  [CategoryIconEnum.iced]: ["Less sweet", "Less ice", "No sugar"],
  [CategoryIconEnum.drink]: ["Less ice", "No ice"],
  [CategoryIconEnum.pastry]: ["Warmed up", "Take-out box"],
  [CategoryIconEnum.meal]: ["No onions", "Spicy", "Sauce on the side"],
  [CategoryIconEnum.sandwich]: ["No onions", "Cut in half"],
  [CategoryIconEnum.salad]: ["Dressing on the side"],
  [CategoryIconEnum.pizza]: ["Cut in squares", "Extra crispy"],
  [CategoryIconEnum.dessert]: ["Take-out box"],
  [CategoryIconEnum.frozen]: ["In a cup"],
};

// Quick-cash buttons offered on the payment screen (rounded up from the total).
export const QUICK_CASH_STEPS = [50, 100, 500, 1000];
