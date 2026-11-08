import type { IServerInfoResponse } from "../models/system/system.response.model";
import requests from "../utils/http_service";

const baseRoute = "system";

const SystemService = {
  getServerInfo: (): Promise<IServerInfoResponse> => requests.get(`${baseRoute}/server-info`),
};

export default SystemService;
