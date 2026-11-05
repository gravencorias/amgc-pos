import type { IPaginationRequest } from "../common/pagination";
import type { ProductAvailabilityEnum } from "../../enums/product.enum";
import type { IProductSize } from "./product.response.model";

export interface IProductTableRequest extends IPaginationRequest {
  categoryId?: number;
  availability: ProductAvailabilityEnum;
  sort?: string;
}

export interface IProductRequest {
  id?: number;
  name: string;
  categoryId: number;
  price: number;
  sizes: IProductSize[];
  addOnIds: number[];
  isAvailable: boolean;
}

// The form keeps "sold in sizes" as its own switch; the request only carries sizes.
export interface IProductFormValues {
  name: string;
  categoryId: number;
  price?: number;
  hasSizes: boolean;
  sizes: IProductSize[];
  addOnIds: number[];
  isAvailable: boolean;
}

export interface ISetProductAvailableRequest {
  id: number;
  isAvailable: boolean;
}
