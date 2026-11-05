import type { CategoryIconEnum } from "../../enums/product.enum";

export interface IProductSize {
  name: string;
  price: number;
}

export interface IProductResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: CategoryIconEnum;
  // The single price, or the lowest size price when the product has sizes.
  price: number;
  sizes: IProductSize[];
  addOnIds: number[];
  photoUrl: string | null;
  isAvailable: boolean;
  updatedAt: string;
}
