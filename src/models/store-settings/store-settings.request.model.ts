import type { IBrandingTheme } from "./store-settings.response.model";

// PUT store-settings/update takes the whole settings object; the logo has its own endpoints.
export interface IStoreSettingsRequest extends IBrandingTheme {
  storeName: string;
  tagline: string | null;
  address: string | null;
  tin: string | null;
  vatRegistered: boolean;
  receiptFooter: string | null;
  showLogoOnReceipt: boolean;
}

export type IStoreDetailsFormValues = Pick<
  IStoreSettingsRequest,
  "storeName" | "tagline" | "address" | "tin" | "vatRegistered" | "receiptFooter" | "showLogoOnReceipt"
>;

export type IBrandingFormValues = IBrandingTheme;
