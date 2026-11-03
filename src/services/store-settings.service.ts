import type { IStoreSettingsRequest } from "../models/store-settings/store-settings.request.model";
import type {
  IPublicStoreSettingsResponse,
  IStoreSettingsResponse,
} from "../models/store-settings/store-settings.response.model";
import requests from "../utils/http_service";

const baseRoute = "store-settings";

const StoreSettingsService = {
  getSettings: (): Promise<IStoreSettingsResponse> => requests.get(baseRoute),
  getPublicSettings: (): Promise<IPublicStoreSettingsResponse> => requests.get(`${baseRoute}/public`),
  updateSettings: (request: IStoreSettingsRequest): Promise<IStoreSettingsResponse> =>
    requests.put(`${baseRoute}/update`, request),
  uploadLogo: (file: Blob): Promise<IStoreSettingsResponse> => requests.postForm(`${baseRoute}/logo`, file),
  removeLogo: (): Promise<IStoreSettingsResponse> => requests.delete(`${baseRoute}/logo`),
};

export default StoreSettingsService;
