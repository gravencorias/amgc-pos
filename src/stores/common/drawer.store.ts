import { create } from "zustand";
import type { IDrawer } from "../../models/common/drawer,model";

type States = {
  drawer: IDrawer;
};

type Actions = {
  showDrawer: (drawer: IDrawer) => void;
  closeDrawer: () => void;
};

const initialValues: States = {
  drawer: {} as IDrawer,
};

export const useDrawerStore = create<States & Actions>()((set) => ({
  ...initialValues,
  showDrawer: (drawer: IDrawer) => set(() => ({ drawer })),
  // Only flips `open`. Keeping the placement, size, title and body lets the drawer slide
  // out the way it came in. Payroll's copy resets everything, so a right-hand drawer
  // closed as an empty one on the left (the default placement).
  closeDrawer: () =>
    set((state) => ({
      drawer: {
        ...state.drawer,
        properties: {
          ...state.drawer.properties,
          open: false,
        },
      },
    })),
}));
