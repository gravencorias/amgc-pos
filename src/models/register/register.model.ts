import type { CategoryIconEnum } from "../../enums/product.enum";

// One line of the order on the register, before it's sold. Prices here are for display;
// the API re-prices the sale when it's charged.
export interface ICartLine {
  key: string;
  productId: number;
  name: string;
  categoryIcon: CategoryIconEnum;
  photoUrl: string | null;
  sizeName: string | null;
  addOns: { id: number; name: string; price: number }[];
  note: string | null;
  unitPrice: number;
  qty: number;
}
