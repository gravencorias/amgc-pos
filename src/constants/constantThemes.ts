import { StoreThemeEnum } from "../enums/branding.enum";

export interface IStoreThemePreset {
  id: StoreThemeEnum;
  name: string;
  note: string;
  // Neutral tint (hue, and saturation in %) and the accent for light and dark mode.
  hue: number;
  tint: number;
  light: string;
  dark: string;
}

// Same presets as the prototype (amgc-pos-prototype/index.html, THEMES).
export const CONSTANT_THEME_PRESETS: IStoreThemePreset[] = [
  { id: StoreThemeEnum.ube, name: "Ube", note: "Filipino purple yam", hue: 270, tint: 18, light: "#6A45B0", dark: "#C4ABF5" },
  { id: StoreThemeEnum.espresso, name: "Espresso", note: "Dark roast brown", hue: 26, tint: 20, light: "#6F4127", dark: "#E3AD86" },
  { id: StoreThemeEnum.matcha, name: "Matcha", note: "Soft tea green", hue: 95, tint: 15, light: "#45702D", dark: "#A9D68A" },
  { id: StoreThemeEnum.calamansi, name: "Calamansi", note: "Bright citrus", hue: 62, tint: 20, light: "#C99A00", dark: "#F2CF3A" },
  { id: StoreThemeEnum.harbor, name: "Harbor", note: "Cool sea teal", hue: 192, tint: 18, light: "#0D6C77", dark: "#6FD0D8" },
  { id: StoreThemeEnum.chili, name: "Chili", note: "Warm red", hue: 8, tint: 18, light: "#B4311E", dark: "#FF917C" },
  { id: StoreThemeEnum.graphite, name: "Graphite", note: "Neutral and quiet", hue: 220, tint: 7, light: "#262B33", dark: "#E4E7EC" },
];

export const DEFAULT_CUSTOM_COLOR = "#0D6C77";
// A custom color's neutrals take its hue at this saturation.
export const CUSTOM_THEME_TINT = 14;
