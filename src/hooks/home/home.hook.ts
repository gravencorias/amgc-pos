import { useNavigate } from "react-router-dom";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";
import { useAuthStore } from "../../stores/common/auth.store";
import { checkIfManager } from "../../utils/roleChecker";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { useCategoriesQuery } from "../category/category.hook";
import { useQuery } from "@tanstack/react-query";
import SaleService from "../../services/sale.service";
import { SALE_SUMMARY_KEY } from "../../constants/constantQueryKeys";
import { phToday } from "../../utils/date.util";

const DEFAULT_STORE_NAME = "My Café";

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
  const { data: categories } = useCategoriesQuery();
  const isManager = checkIfManager(userAccount.tokenInfo?.accessLevels);
  // Cashiers can't read sales (the API returns 403), so only ask for managers.
  const todayQuery = useQuery({
    queryKey: [...SALE_SUMMARY_KEY, phToday()],
    queryFn: () => SaleService.getSummary(phToday()),
    enabled: isManager,
  });
  const productCount = (categories ?? []).reduce((sum, c) => sum + c.productCount, 0);

  // A new store starts as "My Café", which counts as no name yet.
  const hasName = !!settings?.storeName && settings.storeName !== DEFAULT_STORE_NAME;
  const hasAddress = !!settings?.address;

  // What a new store still has to fill in before its first receipt looks right.
  const setupSteps: ISetupStep[] = settings
    ? [
        {
          key: "details",
          title: "Name and address",
          // Says which half is missing, since the default name looks like a real one.
          description:
            hasName === hasAddress
              ? "Printed at the top of every receipt."
              : hasAddress
                ? `Change the store name from "${DEFAULT_STORE_NAME}".`
                : "Add the store's address.",
          done: hasName && hasAddress,
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
        {
          key: "menu",
          title: "Menu",
          description: productCount
            ? `${productCount} product${productCount === 1 ? "" : "s"} ready to sell.`
            : "Add the products the register sells.",
          done: productCount > 0,
          path: CONSTANT_ROUTES.products,
        },
      ]
    : [];

  return {
    userAccount,
    settings,
    isLoading,
    isManager,
    todaySummary: todayQuery.data,
    isLoadingToday: todayQuery.isLoading,
    setupSteps,
    doneCount: setupSteps.filter((s) => s.done).length,
    goTo: (path: string) => navigate(path),
  };
};
