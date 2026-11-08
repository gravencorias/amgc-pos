import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { useThemeStore } from "../../stores/common/theme.store";
import useTouchMode from "../touch/touch.hook";

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
  const isTouch = useTouchMode();

  // Keeps "Match device" branding in step when the OS switches light/dark.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", reapplyBranding);
    return () => media.removeEventListener("change", reapplyBranding);
  }, [reapplyBranding]);

  // Touch mode on <html>, for _touch.scss and isTouchMode().
  useEffect(() => {
    if (isTouch) document.documentElement.dataset.touch = "true";
    else delete document.documentElement.dataset.touch;
  }, [isTouch]);

  return {
    theme,
    queryClient,
    // In touch mode every antd control is the large size: tap targets of 40 px and more.
    componentSize: isTouch ? ("large" as const) : undefined,
  };
};
