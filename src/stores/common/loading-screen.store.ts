import { create } from "zustand";

type States = {
  showScreen: boolean;
  effectiveVisible: boolean;
  shownAt: number | null;
};

type Actions = {
  setShowScreen: (showScreen: boolean) => void;
  setEffectiveVisible: (effectiveVisible: boolean) => void;
  setShownAt: (shownAt: number | null) => void;
};

const initialValues: States = {
  showScreen: true,
  effectiveVisible: true,
  shownAt: null,
};

export const useLoadingScreenStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setShowScreen: (showScreen: boolean) => set({ showScreen }),
  setEffectiveVisible: (effectiveVisible: boolean) => set({ effectiveVisible }),
  setShownAt: (shownAt: number | null) => set({ shownAt }),
}));
