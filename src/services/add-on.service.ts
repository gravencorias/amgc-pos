import type { IAddOnRequest } from "../models/add-on/add-on.request.model";
import type { IAddOnResponse } from "../models/add-on/add-on.response.model";
import requests from "../utils/http_service";

const baseRoute = "add-on";

const AddOnService = {
  getAll: (): Promise<IAddOnResponse[]> => requests.get(`${baseRoute}/all`),
  create: (request: IAddOnRequest): Promise<IAddOnResponse> => requests.post(`${baseRoute}/create`, request),
  update: (request: IAddOnRequest): Promise<IAddOnResponse> => requests.put(`${baseRoute}/update`, request),
  deleteAddOn: (id: number): Promise<IAddOnResponse> => requests.delete(`${baseRoute}/delete/${id}`),
};

export default AddOnService;
