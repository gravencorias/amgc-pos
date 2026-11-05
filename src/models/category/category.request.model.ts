import type { CategoryIconEnum } from "../../enums/product.enum";

export interface ICategoryRequest {
  id?: number;
  name: string;
  icon: CategoryIconEnum;
}
