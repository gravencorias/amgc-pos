import type { IPaginatedResult } from "../models/common/pagination";
import type { ISaleRequest, ISaleTableRequest, ISaleVoidRequest } from "../models/sale/sale.request.model";
import type { ISaleResponse, ISaleSummaryResponse } from "../models/sale/sale.response.model";
import requests from "../utils/http_service";
import { ObjectDeserializer } from "../utils/object_to_param";

const baseRoute = "sale";
const deserializer = new ObjectDeserializer();

const SaleService = {
  create: (request: ISaleRequest): Promise<ISaleResponse> => requests.post(`${baseRoute}/create`, request),
  voidSale: (request: ISaleVoidRequest): Promise<ISaleResponse> => requests.post(`${baseRoute}/void`, request),
  getSummary: (date: string): Promise<ISaleSummaryResponse> => requests.get(`${baseRoute}/summary?date=${date}`),
  getPageList: (request: ISaleTableRequest): Promise<IPaginatedResult<ISaleResponse>> =>
    requests.get(`${baseRoute}?${deserializer.ObjectToParams<ISaleTableRequest>(request)}`),
};

export default SaleService;
