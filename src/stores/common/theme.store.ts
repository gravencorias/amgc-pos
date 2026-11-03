import { theme, type ThemeConfig } from "antd";
import { create } from "zustand";
import { CornerStyleEnum, StoreThemeEnum, TextSizeEnum, ThemeModeEnum } from "../../enums/branding.enum";
import type { IBrandingTheme } from "../../models/store-settings/store-settings.response.model";
import { resolveBranding } from "../../utils/helpers";

export type ThemeMode = "light" | "dark";

type States = {
  theme: ThemeConfig;
  mode: ThemeMode;
  branding: IBrandingTheme;
  siderCollapse: boolean;
};

type Actions = {
  applyBranding: (branding: IBrandingTheme) => void;
  reapplyBranding: () => void;
  setSiderCollapse: (siderCollapse: boolean) => void;
};

const { defaultAlgorithm, darkAlgorithm } = theme;

const DEFAULT_BRANDING: IBrandingTheme = {
  theme: StoreThemeEnum.ube,
  customColor: null,
  mode: ThemeModeEnum.light,
  corners: CornerStyleEnum.soft,
  textSize: TextSizeEnum.normal,
};

// The store's branding drives the whole app: the antd token, the CSS vars used by
// hand-rolled surfaces (_variable.scss), and Tailwind's `primary`.
const buildTheme = (branding: IBrandingTheme): { theme: ThemeConfig; mode: ThemeMode } => {
  const { isDark, accent, ink, hue, radius, fontSize } = resolveBranding(branding);
  const mode: ThemeMode = isDark ? "dark" : "light";

  const root = window.document.documentElement;
  root.setAttribute("data-theme", mode);
  root.style.setProperty("--amgc-primary", accent);
  root.style.setProperty("--amgc-on-primary", ink);
  root.style.setProperty("--amgc-hue", String(hue));

  return {
    mode,
    theme: {
      algorithm: [isDark ? darkAlgorithm : defaultAlgorithm],
      token: {
        colorPrimary: accent,
        colorInfo: accent,
        colorLink: accent,
        colorTextLightSolid: ink,
        controlOutline: "none",
        borderRadius: radius,
        fontSize,
        fontFamily: '"Inter Variable", system-ui, Avenir, Helvetica, Arial, sans-serif',
        ...(isDark
          ? {
              colorBgLayout: `hsl(${hue} 10% 7%)`,
              colorBgContainer: `hsl(${hue} 9% 11%)`,
              colorBgElevated: `hsl(${hue} 9% 14%)`,
              colorBorder: `hsl(${hue} 8% 22%)`,
              colorBorderSecondary: `hsl(${hue} 8% 17%)`,
            }
          : {
              colorBgLayout: `hsl(${hue} 14% 96%)`,
              colorBorder: `hsl(${hue} 10% 86%)`,
              colorBorderSecondary: `hsl(${hue} 12% 91%)`,
            }),
      },
    },
  };
};

const initial = buildTheme(DEFAULT_BRANDING);

export const useThemeStore = create<States & Actions>()((set, get) => ({
  theme: initial.theme,
  mode: initial.mode,
  branding: DEFAULT_BRANDING,
  siderCollapse: false,
  applyBranding: (branding: IBrandingTheme) => set({ branding, ...buildTheme(branding) }),
  // "Match device": the OS switched between light and dark.
  reapplyBranding: () => set({ ...buildTheme(get().branding) }),
  setSiderCollapse: (siderCollapse: boolean) => set(() => ({ siderCollapse })),
}));
