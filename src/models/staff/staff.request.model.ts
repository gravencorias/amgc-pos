import type { IPaginationRequest } from "../common/pagination";
import type { StaffStatusEnum } from "../../enums/staff.enum";

export interface IStaffTableRequest extends IPaginationRequest {
  status: StaffStatusEnum;
  roleCode?: string;
  sort?: string;
}

// staff/create sends everything; staff/update sends id, fullName and (for managers) username.
export interface IStaffRequest {
  id?: number;
  fullName: string;
  roleCode: string;
  username?: string | null;
  password?: string | null;
  pin?: string | null;
}

// The form also asks for the new PIN or password twice.
export interface IStaffFormValues extends IStaffRequest {
  confirmSecret?: string;
}

export interface IResetPinRequest {
  id: number;
  pin: string;
}

export interface IResetPasswordRequest {
  id: number;
  password: string;
}

export interface IStaffCredentialFormValues {
  secret: string;
  confirmSecret: string;
}

export interface ISetStaffActiveRequest {
  id: number;
  isActive: boolean;
}
