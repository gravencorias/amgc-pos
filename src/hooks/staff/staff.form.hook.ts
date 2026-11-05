import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import StaffService from "../../services/staff.service";
import type { IStaffFormValues, IStaffRequest } from "../../models/staff/staff.request.model";
import type { IStaffResponse } from "../../models/staff/staff.response.model";
import { UserRoleEnum } from "../../enums/user-role.enum";
import { useAuthStore } from "../../stores/common/auth.store";
import { useModalStore } from "../../stores/common/modal.store";
import { useStaffStore } from "../../stores/data/staff.store";
import { Toast } from "../../utils/http_service";
import { checkIfOwner } from "../../utils/roleChecker";
import { getApiErrorMessage } from "../../utils/helpers";
import { STAFF_LIST_KEY } from "./staff.hook";

// One form for adding and editing, keyed off editingStaff (null = adding).
export const useStaffFormHook = () => {
  const [form] = Form.useForm<IStaffFormValues>();
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();
  const { editingStaff, setEditingStaff } = useStaffStore();
  const userAccount = useAuthStore((state) => state.userAccount);
  const isOwner = checkIfOwner(userAccount.tokenInfo?.accessLevels);
  const isEditing = !!editingStaff;

  const roleCode = Form.useWatch("roleCode", form) ?? editingStaff?.roleCode ?? UserRoleEnum.cashier;
  const isCashier = roleCode === UserRoleEnum.cashier;

  useEffect(() => {
    if (editingStaff) {
      form.setFieldsValue({
        id: editingStaff.id,
        fullName: editingStaff.fullName,
        roleCode: editingStaff.roleCode,
        username: editingStaff.username,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ roleCode: UserRoleEnum.cashier });
    }
  }, [editingStaff, form]);

  const staffMutation = useMutation({
    mutationFn: (request: IStaffRequest) => (isEditing ? StaffService.update(request) : StaffService.create(request)),
    onSuccess: (response: IStaffResponse) => {
      Toast.fire({
        icon: "success",
        title: isEditing ? `${response.fullName} saved` : `${response.fullName} can now sign in`,
      });
      queryClient.invalidateQueries(STAFF_LIST_KEY);
      // Editing your own name changes what the side menu shows.
      if (response.id === userAccount.id) queryClient.invalidateQueries(["get-me"]);
      handleClose();
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "This person couldn't be saved.") }),
  });

  const handleClose = () => {
    setEditingStaff(null);
    form.resetFields();
    closeModal();
  };

  const handleSubmit = (values: IStaffFormValues) => {
    const fullName = values.fullName.trim();
    if (isEditing && editingStaff) {
      staffMutation.mutate({
        id: editingStaff.id,
        fullName,
        roleCode: editingStaff.roleCode,
        username: editingStaff.username !== null ? values.username?.trim().toLowerCase() : null,
      });
      return;
    }
    staffMutation.mutate({
      fullName,
      roleCode: values.roleCode,
      pin: isCashier ? values.pin : null,
      username: isCashier ? null : values.username?.trim().toLowerCase(),
      password: isCashier ? null : values.password,
    });
  };

  return {
    form,
    isEditing,
    editingStaff,
    isOwner,
    isCashier,
    handleClose,
    handleSubmit,
    isSaving: staffMutation.isLoading,
  };
};
