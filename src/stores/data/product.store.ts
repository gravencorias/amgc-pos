import { create } from "zustand";
import { IPaginationStoreValues } from "../../models/common/pagination";
import type { IProductTableRequest } from "../../models/product/product.request.model";
import type { IProductResponse } from "../../models/product/product.response.model";
import { ProductAvailabilityEnum } from "../../enums/product.enum";

export type IPendingPhoto = { blob: Blob; previewUrl: string };

type States = {
  productPagination: IProductTableRequest;
  // null = the form is adding a new product.
  editingProduct: IProductResponse | null;
  // The row whose action menu is open.
  menuProduct: IProductResponse | null;
  // A photo picked in the form, uploaded only once the product itself saves.
  pendingPhoto: IPendingPhoto | null;
  // The form's "Remove photo", applied on save.
  removePhoto: boolean;
};

type Actions = {
  setProductPagination: (productPagination: IProductTableRequest) => void;
  setEditingProduct: (editingProduct: IProductResponse | null) => void;
  setMenuProduct: (menuProduct: IProductResponse | null) => void;
  setPendingPhoto: (pendingPhoto: IPendingPhoto | null) => void;
  setRemovePhoto: (removePhoto: boolean) => void;
};

const initialValues: States = {
  productPagination: new IPaginationStoreValues({
    pageNumber: 1,
    pageSize: 10,
    availability: ProductAvailabilityEnum.all,
  }) as IProductTableRequest,
  editingProduct: null,
  menuProduct: null,
  pendingPhoto: null,
  removePhoto: false,
};

export const useProductStore = create<States & Actions>()((set, get) => ({
  ...initialValues,
  setProductPagination: (productPagination) => set({ productPagination }),
  setEditingProduct: (editingProduct) => set({ editingProduct }),
  setMenuProduct: (menuProduct) => set({ menuProduct }),
  // Frees the old preview's object URL whenever the photo is replaced or cleared.
  setPendingPhoto: (pendingPhoto) => {
    const previous = get().pendingPhoto;
    if (previous && previous.previewUrl !== pendingPhoto?.previewUrl) URL.revokeObjectURL(previous.previewUrl);
    set({ pendingPhoto });
  },
  setRemovePhoto: (removePhoto) => set({ removePhoto }),
}));
