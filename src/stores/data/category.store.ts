import { create } from "zustand";
import type { ICategoryResponse } from "../../models/category/category.response.model";

type States = {
  // null = the categories panel's form is adding a new category.
  editingCategory: ICategoryResponse | null;
};

type Actions = {
  setEditingCategory: (editingCategory: ICategoryResponse | null) => void;
};

export const useCategoryStore = create<States & Actions>()((set) => ({
  editingCategory: null,
  setEditingCategory: (editingCategory) => set({ editingCategory }),
}));
