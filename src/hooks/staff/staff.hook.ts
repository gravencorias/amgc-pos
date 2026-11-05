import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import StaffService from "../../services/staff.service";
import type { IStaffResponse } from "../../models/staff/staff.response.model";
import type { IStaffTableRequest } from "../../models/staff/staff.request.model";
import { StaffStatusEnum } from "../../enums/staff.enum";
import { UserRoleEnum } from "../../enums/user-role.enum";
import { useAuthStore } from "../../stores/common/auth.store";
import { useModalStore } from "../../stores/common/modal.store";
import { useStaffStore } from "../../stores/data/staff.store";
import { debounce } from "../../utils/debouncer";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { canManageStaff, checkIfOwner } from "../../utils/roleChecker";
import { getApiErrorMessage } from "../../utils/helpers";

export const STAFF_LIST_KEY = ["staff-list"];

export type IStaffPermissions = {
  canEdit: boolean;
  canResetCredential: boolean;
  canSetActive: boolean;
  // Why something is greyed out, shown in the row menu.
  reason?: string;
};

export const useStaffHook = () => {
  const queryClient = useQueryClient();
  const { showModal } = useModalStore();
  const { staffPagination, setStaffPagination, setEditingStaff, setCredentialStaff, menuStaff, setMenuStaff } =
    useStaffStore();
  const userAccount = useAuthStore((state) => state.userAccount);
  const accessLevels = userAccount.tokenInfo?.accessLevels;
  const myId = userAccount.id;
  const isOwner = checkIfOwner(accessLevels);

  const getStaffList = useQuery({
    queryKey: [...STAFF_LIST_KEY, staffPagination],
    queryFn: () => StaffService.getPageList({ ...staffPagination }),
  });

  const setActiveMutation = useMutation({
    mutationFn: StaffService.setActive,
    onSuccess: (response: IStaffResponse) => {
      Toast.fire({
        icon: "success",
        title: response.isActive ? `${response.fullName} can sign in again` : `${response.fullName} is turned off`,
      });
      queryClient.invalidateQueries(STAFF_LIST_KEY);
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "That change couldn't be saved.") }),
  });

  // The same rule amgc-pos-api enforces: the owner manages everyone, a manager only cashiers.
  const permissionsFor = (record: IStaffResponse | null): IStaffPermissions => {
    if (!record) return { canEdit: false, canResetCredential: false, canSetActive: false };
    const canManage = canManageStaff(accessLevels, record.roleCode);
    if (!canManage) {
      return {
        canEdit: false,
        canResetCredential: false,
        canSetActive: false,
        reason: "Only the owner can change an owner's or manager's account.",
      };
    }
    const isSelf = record.id === myId;
    const isOwnerAccount = record.roleCode === UserRoleEnum.owner;
    return {
      canEdit: true,
      canResetCredential: true,
      canSetActive: !isSelf && !isOwnerAccount,
      reason: isSelf
        ? "You can't turn off your own account."
        : isOwnerAccount
          ? "The owner's account can't be turned off."
          : undefined,
    };
  };

  const handleSetActive = (record: IStaffResponse) => {
    const turningOff = record.isActive;
    showPopConfirmation({
      title: turningOff ? `Turn off ${record.fullName}?` : `Turn ${record.fullName} back on?`,
      text: turningOff
        ? `${record.fullName} won't be able to sign in. Their past sales keep their name.`
        : `${record.fullName} will be able to sign in again with their current ${
            record.roleCode === UserRoleEnum.cashier ? "PIN" : "password"
          }.`,
      confirmButtonText: turningOff ? "Turn off" : "Turn on",
    }).then((result) => {
      if (result.isConfirmed) setActiveMutation.mutate({ id: record.id, isActive: !record.isActive });
    });
  };

  const updatePagination = (changes: Partial<IStaffTableRequest>) =>
    setStaffPagination({ ...staffPagination, ...changes, pageNumber: 1 });

  const onSearch = (value: string) =>
    debounce({ debouncer: () => updatePagination({ search: value }), debounceTimeout: 600 });

  const onTableChange = (
    tableConfig: TablePaginationConfig,
    _: Record<string, FilterValue | null>,
    sorter: SorterResult<IStaffResponse> | SorterResult<IStaffResponse>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    setStaffPagination({
      ...staffPagination,
      pageNumber: tableConfig.current ?? 1,
      pageSize: tableConfig.pageSize ?? 10,
      sort: single?.columnKey && single.order ? `${single.columnKey}_${single.order}` : undefined,
    });
  };

  return {
    getStaffList,
    staffPagination,
    isOwner,
    myId,
    menuStaff,
    setMenuStaff,
    permissionsFor,
    showModal,
    setEditingStaff,
    setCredentialStaff,
    handleSetActive,
    isSettingActive: setActiveMutation.isLoading,
    onSearch,
    onStatusChange: (status: StaffStatusEnum) => updatePagination({ status }),
    onRoleChange: (roleCode: string | undefined) => updatePagination({ roleCode }),
    onTableChange,
  };
};
