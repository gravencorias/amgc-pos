import { create } from "zustand";
import type { IDayCloseTableRequest } from "../../models/day-close/day-close.request.model";
import type { IDayCloseResponse } from "../../models/day-close/day-close.response.model";

type States = {
  closePagination: IDayCloseTableRequest;
  // The Z reading open in the modal.
  viewingClose: IDayCloseResponse | null;
};

type Actions = {
  setClosePagination: (closePagination: IDayCloseTableRequest) => void;
  setViewingClose: (viewingClose: IDayCloseResponse | null) => void;
};

export const useCloseDayStore = create<States & Actions>()((set) => ({
  closePagination: { pageNumber: 1, pageSize: 10 },
  viewingClose: null,
  setClosePagination: (closePagination) => set({ closePagination }),
  setViewingClose: (viewingClose) => set({ viewingClose }),
}));
