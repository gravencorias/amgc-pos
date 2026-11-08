import type { IServerInfoResponse, IVersionResponse } from "../models/system/system.response.model";
import requests from "../utils/http_service";

const baseRoute = "system";

const SystemService = {
  getServerInfo: (): Promise<IServerInfoResponse> => requests.get(`${baseRoute}/server-info`),
  getVersion: (): Promise<IVersionResponse> => requests.get(`${baseRoute}/version`),
};

export default SystemService;
