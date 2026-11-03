import { create } from "zustand";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";

type States = {
  token: string | null;
  isAuthenticated: boolean;
  userAccount: IUserAccountResponse;
};

type Actions = {
  setToken: (token: string | null) => void;
  getToken: () => string | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUserAccount: (userAccount: IUserAccountResponse) => void;
  logout: () => void;
};

// "hr_token" is the key utils/http_service.ts (copied verbatim from payroll) reads.
const initialValues: States = {
  token: window.localStorage.getItem("hr_token"),
  isAuthenticated: false,
  userAccount: {} as IUserAccountResponse,
};

export const useAuthStore = create<States & Actions>()((set, get) => ({
  ...initialValues,
  setToken: (token: string | null) => {
    if (token !== null) {
      window.localStorage.setItem("hr_token", token);
    } else {
      window.localStorage.removeItem("hr_token");
    }

    set({
      token,
      isAuthenticated: !!token,
    });
  },
  getToken: () => get().token,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setUserAccount: (userAccount: IUserAccountResponse) => set(() => ({ userAccount })),
  // A full reload to the login page also clears the query cache of the person who left.
  logout: () => {
    get().setToken(null);
    window.location.assign(CONSTANT_ROUTES.login);
  },
}));
