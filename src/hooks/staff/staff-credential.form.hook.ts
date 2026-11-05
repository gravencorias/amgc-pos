import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import StaffService from "../../services/staff.service";
import type { IStaffCredentialFormValues } from "../../models/staff/staff.request.model";
import type { IStaffResponse } from "../../models/staff/staff.response.model";
import type { StaffCredentialKind } from "../../enums/staff.enum";
import { UserRoleEnum } from "../../enums/user-role.enum";
import { useAuthStore } from "../../stores/common/auth.store";
import { useModalStore } from "../../stores/common/modal.store";
import { useStaffStore } from "../../stores/data/staff.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { STAFF_LIST_KEY } from "./staff.hook";

// Sets a new PIN (cashiers) or password (owners and managers) for credentialStaff.
export const useStaffCredentialFormHook = () => {
  const [form] = Form.useForm<IStaffCredentialFormValues>();
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();
  const { credentialStaff, setCredentialStaff } = useStaffStore();
  const myId = useAuthStore((state) => state.userAccount.id);

  const kind: StaffCredentialKind = credentialStaff?.roleCode === UserRoleEnum.cashier ? "pin" : "password";
  const isSelf = credentialStaff?.id === myId;

  // A fresh, empty form every time the modal opens for someone.
  useEffect(() => {
    form.resetFields();
  }, [credentialStaff, form]);

  const credentialMutation = useMutation({
    mutationFn: (secret: string) =>
      kind === "pin"
        ? StaffService.resetPin({ id: credentialStaff!.id, pin: secret })
        : StaffService.resetPassword({ id: credentialStaff!.id, password: secret }),
    onSuccess: (response: IStaffResponse) => {
      Toast.fire({
        icon: "success",
        title: kind === "pin" ? `New PIN saved for ${response.fullName}` : `New password saved for ${response.fullName}`,
      });
      queryClient.invalidateQueries(STAFF_LIST_KEY);
      handleClose();
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The new sign-in couldn't be saved.") }),
  });

  const handleClose = () => {
    setCredentialStaff(null);
    form.resetFields();
    closeModal();
  };

  const handleSubmit = (values: IStaffCredentialFormValues) => {
    if (!credentialStaff) return;
    credentialMutation.mutate(values.secret);
  };

  return {
    form,
    kind,
    isSelf,
    credentialStaff,
    handleClose,
    handleSubmit,
    isSaving: credentialMutation.isLoading,
  };
};
