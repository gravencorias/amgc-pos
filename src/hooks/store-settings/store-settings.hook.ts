import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import StoreSettingsService from "../../services/store-settings.service";
import { useAuthStore } from "../../stores/common/auth.store";
import { useThemeStore } from "../../stores/common/theme.store";

export const STORE_SETTINGS_KEY = ["store-settings"];
export const PUBLIC_STORE_SETTINGS_KEY = ["store-settings-public"];

// Read-only access to the cached settings, for pages and components.
export const useStoreSettingsQuery = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: STORE_SETTINGS_KEY,
    queryFn: StoreSettingsService.getSettings,
    enabled: !!token,
  });
};

// Called once, by ProtectedLayout: loads the settings and paints the app in the store's branding.
export const useStoreSettingsHook = () => {
  const storeSettingsQuery = useStoreSettingsQuery();
  const applyBranding = useThemeStore((state) => state.applyBranding);
  const { data } = storeSettingsQuery;

  // Synced off `data`, not onSuccess, so it also runs for cached data.
  useEffect(() => {
    if (!data) return;
    applyBranding({
      theme: data.theme,
      customColor: data.customColor,
      mode: data.mode,
      corners: data.corners,
      textSize: data.textSize,
    });
    if (data.storeName) document.title = `${data.storeName} · AMGC POS`;
  }, [data, applyBranding]);

  return { storeSettingsQuery };
};
