// String values are what amgc-pos-api stores for StoreSettings; keep them in step with the API.

export enum StoreThemeEnum {
  ube = "ube",
  espresso = "espresso",
  matcha = "matcha",
  calamansi = "calamansi",
  harbor = "harbor",
  chili = "chili",
  graphite = "graphite",
  custom = "custom",
}

export enum ThemeModeEnum {
  light = "light",
  dark = "dark",
  auto = "auto",
}

export enum CornerStyleEnum {
  rounded = "rounded",
  soft = "soft",
  square = "square",
}

export enum TextSizeEnum {
  normal = "normal",
  large = "large",
}

export const themeModeLabel: Record<ThemeModeEnum, string> = {
  [ThemeModeEnum.light]: "Light",
  [ThemeModeEnum.dark]: "Dark",
  [ThemeModeEnum.auto]: "Match device",
};

export const cornerStyleLabel: Record<CornerStyleEnum, string> = {
  [CornerStyleEnum.rounded]: "Rounded",
  [CornerStyleEnum.soft]: "Soft",
  [CornerStyleEnum.square]: "Square",
};

export const textSizeLabel: Record<TextSizeEnum, string> = {
  [TextSizeEnum.normal]: "Normal",
  [TextSizeEnum.large]: "Large",
};
