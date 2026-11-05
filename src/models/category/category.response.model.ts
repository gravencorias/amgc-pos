import type { CategoryIconEnum } from "../../enums/product.enum";

export interface ICategoryResponse {
  id: number;
  name: string;
  icon: CategoryIconEnum;
  sortOrder: number;
  productCount: number;
}
