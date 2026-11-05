import type { IPaginatedResult } from "../models/common/pagination";
import type {
  IDayCloseRequest,
  IDayCloseTableRequest,
  IDayReopenRequest,
} from "../models/day-close/day-close.request.model";
import type {
  IDayCloseCurrentResponse,
  IDayCloseResponse,
  IDayCloseTodayResponse,
} from "../models/day-close/day-close.response.model";
import requests from "../utils/http_service";
import { ObjectDeserializer } from "../utils/object_to_param";

const baseRoute = "day-close";
const deserializer = new ObjectDeserializer();

const DayCloseService = {
  getToday: (): Promise<IDayCloseTodayResponse> => requests.get(`${baseRoute}/today`),
  getCurrent: (): Promise<IDayCloseCurrentResponse> => requests.get(`${baseRoute}/current`),
  create: (request: IDayCloseRequest): Promise<IDayCloseResponse> => requests.post(`${baseRoute}/create`, request),
  reopen: (request: IDayReopenRequest): Promise<IDayCloseResponse> => requests.post(`${baseRoute}/reopen`, request),
  getPageList: (request: IDayCloseTableRequest): Promise<IPaginatedResult<IDayCloseResponse>> =>
    requests.get(`${baseRoute}?${deserializer.ObjectToParams<IDayCloseTableRequest>(request)}`),
};

export default DayCloseService;
