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
  closeDrawer: () =>
    set(() => ({
      drawer: {
        properties: {
          open: false,
        },
        body: undefined,
      },
    })),
}));
