import { create } from "zustand";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import type { PaymentMethodEnum } from "../../enums/sale.enum";
import { phToday } from "../../utils/date.util";

export type ISalesPagination = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  paymentMethod?: PaymentMethodEnum;
  sort?: string;
};

type States = {
  // The day being reported on, YYYY-MM-DD (Philippine time).
  salesDate: string;
  salesPagination: ISalesPagination;
  // The receipt open in the modal.
  viewingSale: ISaleResponse | null;
};

type Actions = {
  setSalesDate: (salesDate: string) => void;
  setSalesPagination: (salesPagination: ISalesPagination) => void;
  setViewingSale: (viewingSale: ISaleResponse | null) => void;
};

export const useSalesStore = create<States & Actions>()((set) => ({
  salesDate: phToday(),
  salesPagination: { pageNumber: 1, pageSize: 10 },
  viewingSale: null,
  // A new day starts the receipts list from page one.
  setSalesDate: (salesDate) => set((state) => ({ salesDate, salesPagination: { ...state.salesPagination, pageNumber: 1 } })),
  setSalesPagination: (salesPagination) => set({ salesPagination }),
  setViewingSale: (viewingSale) => set({ viewingSale }),
}));
