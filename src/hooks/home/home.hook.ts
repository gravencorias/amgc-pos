import { useNavigate } from "react-router-dom";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";
import { useAuthStore } from "../../stores/common/auth.store";
import { checkIfManager } from "../../utils/roleChecker";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";

export type ISetupStep = {
  key: string;
  title: string;
  description: string;
  done: boolean;
  path: string;
};

export const useHomeHook = () => {
  const navigate = useNavigate();
  const userAccount = useAuthStore((state) => state.userAccount);
  const { data: settings, isLoading } = useStoreSettingsQuery();
  const isManager = checkIfManager(userAccount.tokenInfo?.accessLevels);

  // What a new store still has to fill in before its first receipt looks right.
  const setupSteps: ISetupStep[] = settings
    ? [
        {
          key: "details",
          title: "Name and address",
          description: "Printed at the top of every receipt.",
          done: !!settings.storeName && settings.storeName !== "My Café" && !!settings.address,
          path: CONSTANT_ROUTES.storeDetails,
        },
        {
          key: "tin",
          title: "TIN",
          description: "Required on official receipts.",
          done: !!settings.tin,
          path: CONSTANT_ROUTES.storeDetails,
        },
        {
          key: "logo",
          title: "Logo",
          description: "Shown on the register, the sign-in screen and receipts.",
          done: !!settings.logoUrl,
          path: CONSTANT_ROUTES.branding,
        },
      ]
    : [];

  return {
    userAccount,
    settings,
    isLoading,
    isManager,
    setupSteps,
    doneCount: setupSteps.filter((s) => s.done).length,
    goTo: (path: string) => navigate(path),
  };
};
