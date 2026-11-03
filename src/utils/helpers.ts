import { CONSTANT_THEME_PRESETS, DEFAULT_CUSTOM_COLOR } from "../constants/constantThemes";
import { CornerStyleEnum, StoreThemeEnum, TextSizeEnum, ThemeModeEnum } from "../enums/branding.enum";
import type { IBrandingTheme } from "../models/store-settings/store-settings.response.model";

export const getInitials = (name: string | undefined | null) => {
  const words = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
};

export const getGreeting = (date = new Date()) => {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex: string) => {
  const c = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

// Text on top of the brand color: dark on light colors, white on dark ones.
export const readableInkFor = (hex: string) => (luminance(hex) > 0.42 ? "#16130F" : "#FFFFFF");

const hexToHue = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round(h * 60);
};

// Lighter version of a custom color for dark mode, so it stays visible on dark surfaces.
const lightenForDark = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  const mix = (v: number) => Math.round(v + (255 - v) * 0.45);
  return luminance(hex) > 0.35 ? hex : `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

export const resolveIsDark = (mode: ThemeModeEnum) =>
  mode === ThemeModeEnum.dark ||
  (mode === ThemeModeEnum.auto && window.matchMedia("(prefers-color-scheme: dark)").matches);

// Everything a screen needs to paint a store's branding.
export const resolveBranding = (branding: IBrandingTheme) => {
  const isDark = resolveIsDark(branding.mode);
  const preset = CONSTANT_THEME_PRESETS.find((p) => p.id === branding.theme) ?? CONSTANT_THEME_PRESETS[0];
  const custom = branding.customColor || DEFAULT_CUSTOM_COLOR;
  const isCustom = branding.theme === StoreThemeEnum.custom;
  const accent = isCustom ? (isDark ? lightenForDark(custom) : custom) : isDark ? preset.dark : preset.light;

  return {
    isDark,
    accent,
    ink: readableInkFor(accent),
    hue: isCustom ? hexToHue(custom) : preset.hue,
    radius: branding.corners === CornerStyleEnum.rounded ? 14 : branding.corners === CornerStyleEnum.square ? 3 : 8,
    fontSize: branding.textSize === TextSizeEnum.large ? 16 : 14,
  };
};
