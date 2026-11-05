import type { IPaginatedResult } from "../models/common/pagination";
import type {
  IResetPasswordRequest,
  IResetPinRequest,
  ISetStaffActiveRequest,
  IStaffRequest,
  IStaffTableRequest,
} from "../models/staff/staff.request.model";
import type { IStaffResponse } from "../models/staff/staff.response.model";
import requests from "../utils/http_service";
import { ObjectDeserializer } from "../utils/object_to_param";

const baseRoute = "staff";
const deserializer = new ObjectDeserializer();

const StaffService = {
  getPageList: (request: IStaffTableRequest): Promise<IPaginatedResult<IStaffResponse>> =>
    requests.get(`${baseRoute}?${deserializer.ObjectToParams<IStaffTableRequest>(request)}`),
  create: (request: IStaffRequest): Promise<IStaffResponse> => requests.post(`${baseRoute}/create`, request),
  update: (request: IStaffRequest): Promise<IStaffResponse> => requests.put(`${baseRoute}/update`, request),
  resetPin: (request: IResetPinRequest): Promise<IStaffResponse> => requests.put(`${baseRoute}/reset-pin`, request),
  resetPassword: (request: IResetPasswordRequest): Promise<IStaffResponse> =>
    requests.put(`${baseRoute}/reset-password`, request),
  setActive: (request: ISetStaffActiveRequest): Promise<IStaffResponse> =>
    requests.put(`${baseRoute}/set-active`, request),
};

export default StaffService;
