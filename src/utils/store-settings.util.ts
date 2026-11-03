import type { IStoreSettingsRequest } from "../models/store-settings/store-settings.request.model";
import type { IStoreSettingsResponse } from "../models/store-settings/store-settings.response.model";

// PUT store-settings/update replaces the whole object, so each form sends the
// cached settings with only its own fields changed.
export const toStoreSettingsRequest = (settings: IStoreSettingsResponse): IStoreSettingsRequest => ({
  storeName: settings.storeName,
  tagline: settings.tagline,
  address: settings.address,
  tin: settings.tin,
  vatRegistered: settings.vatRegistered,
  receiptFooter: settings.receiptFooter,
  showLogoOnReceipt: settings.showLogoOnReceipt,
  theme: settings.theme,
  customColor: settings.customColor,
  mode: settings.mode,
  corners: settings.corners,
  textSize: settings.textSize,
});

// Empty optional text fields go to the API as null, not "".
export const emptyToNull = (value: string | null | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
};
