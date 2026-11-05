import type { ICategoryRequest } from "../models/category/category.request.model";
import type { ICategoryResponse } from "../models/category/category.response.model";
import requests from "../utils/http_service";

const baseRoute = "category";

const CategoryService = {
  getAll: (): Promise<ICategoryResponse[]> => requests.get(`${baseRoute}/all`),
  create: (request: ICategoryRequest): Promise<ICategoryResponse> => requests.post(`${baseRoute}/create`, request),
  update: (request: ICategoryRequest): Promise<ICategoryResponse> => requests.put(`${baseRoute}/update`, request),
  deleteCategory: (id: number): Promise<ICategoryResponse> => requests.delete(`${baseRoute}/delete/${id}`),
};

export default CategoryService;
