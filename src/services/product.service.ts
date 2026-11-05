import type { IPaginatedResult } from "../models/common/pagination";
import type {
  IProductRequest,
  IProductTableRequest,
  ISetProductAvailableRequest,
} from "../models/product/product.request.model";
import type { IProductResponse } from "../models/product/product.response.model";
import requests from "../utils/http_service";
import { ObjectDeserializer } from "../utils/object_to_param";

const baseRoute = "product";
const deserializer = new ObjectDeserializer();

const ProductService = {
  getPageList: (request: IProductTableRequest): Promise<IPaginatedResult<IProductResponse>> =>
    requests.get(`${baseRoute}?${deserializer.ObjectToParams<IProductTableRequest>(request)}`),
  // The register's whole menu, sold-out items included.
  getAll: (): Promise<IProductResponse[]> => requests.get(`${baseRoute}/all`),
  create: (request: IProductRequest): Promise<IProductResponse> => requests.post(`${baseRoute}/create`, request),
  update: (request: IProductRequest): Promise<IProductResponse> => requests.put(`${baseRoute}/update`, request),
  setAvailable: (request: ISetProductAvailableRequest): Promise<IProductResponse> =>
    requests.put(`${baseRoute}/set-available`, request),
  deleteProduct: (id: number): Promise<IProductResponse> => requests.delete(`${baseRoute}/delete/${id}`),
  uploadPhoto: (id: number, file: Blob): Promise<IProductResponse> => requests.postForm(`${baseRoute}/${id}/photo`, file),
  removePhoto: (id: number): Promise<IProductResponse> => requests.delete(`${baseRoute}/${id}/photo`),
};

export default ProductService;
