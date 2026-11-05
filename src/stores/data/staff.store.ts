import { create } from "zustand";
import { IPaginationStoreValues } from "../../models/common/pagination";
import type { IStaffTableRequest } from "../../models/staff/staff.request.model";
import type { IStaffResponse } from "../../models/staff/staff.response.model";
import { StaffStatusEnum } from "../../enums/staff.enum";

type States = {
  staffPagination: IStaffTableRequest;
  // null = the form is adding someone new.
  editingStaff: IStaffResponse | null;
  // The person whose PIN or password is being reset.
  credentialStaff: IStaffResponse | null;
  // The row whose action menu is open, so the menu can label and gate its items.
  menuStaff: IStaffResponse | null;
};

type Actions = {
  setStaffPagination: (staffPagination: IStaffTableRequest) => void;
  setEditingStaff: (editingStaff: IStaffResponse | null) => void;
  setCredentialStaff: (credentialStaff: IStaffResponse | null) => void;
  setMenuStaff: (menuStaff: IStaffResponse | null) => void;
};

const initialValues: States = {
  staffPagination: new IPaginationStoreValues({
    pageNumber: 1,
    pageSize: 10,
    status: StaffStatusEnum.active,
  }) as IStaffTableRequest,
  editingStaff: null,
  credentialStaff: null,
  menuStaff: null,
};

export const useStaffStore = create<States & Actions>()((set) => ({
  ...initialValues,
  setStaffPagination: (staffPagination) => set({ staffPagination }),
  setEditingStaff: (editingStaff) => set({ editingStaff }),
  setCredentialStaff: (credentialStaff) => set({ credentialStaff }),
  setMenuStaff: (menuStaff) => set({ menuStaff }),
}));
