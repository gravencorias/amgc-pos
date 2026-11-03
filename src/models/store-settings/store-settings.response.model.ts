import type { CornerStyleEnum, StoreThemeEnum, TextSizeEnum, ThemeModeEnum } from "../../enums/branding.enum";

// The look of the register. Shared by the full settings and the public (signed-out) view.
export interface IBrandingTheme {
  theme: StoreThemeEnum;
  customColor: string | null;
  mode: ThemeModeEnum;
  corners: CornerStyleEnum;
  textSize: TextSizeEnum;
}

export interface IStoreSettingsResponse extends IBrandingTheme {
  storeName: string;
  tagline: string | null;
  address: string | null;
  tin: string | null;
  vatRegistered: boolean;
  receiptFooter: string | null;
  showLogoOnReceipt: boolean;
  logoUrl: string | null;
  updatedAt: string;
}

// GET store-settings/public: what the login screen may show before anyone signs in.
export interface IPublicStoreSettingsResponse extends IBrandingTheme {
  storeName: string;
  logoUrl: string | null;
}
