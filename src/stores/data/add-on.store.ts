import { create } from "zustand";
import type { IAddOnResponse } from "../../models/add-on/add-on.response.model";

type States = {
  // null = the add-ons panel's form is adding a new add-on.
  editingAddOn: IAddOnResponse | null;
};

type Actions = {
  setEditingAddOn: (editingAddOn: IAddOnResponse | null) => void;
};

export const useAddOnStore = create<States & Actions>()((set) => ({
  editingAddOn: null,
  setEditingAddOn: (editingAddOn) => set({ editingAddOn }),
}));
