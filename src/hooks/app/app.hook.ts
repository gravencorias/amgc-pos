import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { useThemeStore } from "../../stores/common/theme.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const useAppHook = () => {
  const theme = useThemeStore((state) => state.theme);
  const reapplyBranding = useThemeStore((state) => state.reapplyBranding);

  // Keeps "Match device" branding in step when the OS switches light/dark.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", reapplyBranding);
    return () => media.removeEventListener("change", reapplyBranding);
  }, [reapplyBranding]);

  return {
    theme,
    queryClient,
  };
};
