export interface IPagination {
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export class IPaginatedResult<T> {
  data: T[];
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;

  constructor(data: T[], pagination: IPagination) {
    this.data = data;
    this.currentPage = pagination.currentPage;
    this.pageSize = pagination.pageSize;
    this.totalCount = pagination.totalCount;
    this.totalPages = pagination.totalPages;
  }
}
export interface ISortAndShowSize {
  sort?: string;
  showSize?: number;
}

export interface IPaginationRequest<T = any> {
  pageNumber: number;
  pageSize: number;
  search?: string;
  [key: string]: T | number | string | undefined;
}

export class IPaginationStoreValues implements IPaginationRequest {
  pageSize: number = 10;
  pageNumber: number = 1;

  constructor(init?: IPaginationRequest) {
    Object.assign(this, init);
  }
}
