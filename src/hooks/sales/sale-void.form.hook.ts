import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import SaleService from "../../services/sale.service";
import type { ISaleVoidFormValues } from "../../models/sale/sale.request.model";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { DAY_CLOSE_CURRENT_KEY, SALE_LIST_KEY, SALE_SUMMARY_KEY } from "../../constants/constantQueryKeys";
import { useAuthStore } from "../../stores/common/auth.store";
import { checkIfManager } from "../../utils/roleChecker";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";

export interface ISaleVoidFormProps {
  sale: ISaleResponse;
  // Back to wherever the form was opened from (the receipt), without voiding.
  onBack: () => void;
  // Called with the voided sale, so the opener can show its receipt again.
  onVoided: (sale: ISaleResponse) => void;
}

// Voids a whole sale. Used from the Sales page's receipt and the Register's receipt
// after Charge. An owner or manager approves their own void; a cashier's needs an owner
// or manager to enter their username and password on the spot.
export const useSaleVoidFormHook = ({ sale, onBack, onVoided }: ISaleVoidFormProps) => {
  const [form] = Form.useForm<ISaleVoidFormValues>();
  const queryClient = useQueryClient();
  const userAccount = useAuthStore((state) => state.userAccount);
  const needsApproval = !checkIfManager(userAccount.tokenInfo?.roles);
  const reason = (Form.useWatch("reason", form) as string | undefined) ?? "";

  useEffect(() => {
    form.setFieldsValue({ reason: "", approverUsername: "", approverPassword: "" });
  }, [form]);

  // antd's Modal takes focus as it opens, which beats autoFocus, so focus the box once it has.
  useEffect(() => {
    const id = window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".ant-modal textarea.amgc-focus-first")?.focus(), 120);
    return () => window.clearTimeout(id);
  }, []);

  const voidMutation = useMutation({
    mutationFn: SaleService.voidSale,
    onSuccess: (voided: ISaleResponse) => {
      // The day's totals and the receipts list both change.
      queryClient.invalidateQueries(SALE_SUMMARY_KEY);
      queryClient.invalidateQueries(SALE_LIST_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_CURRENT_KEY);
      Toast.fire({ icon: "success", title: `Receipt ${voided.receiptNumber} is void.` });
      onVoided(voided);
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) => {
      form.setFieldValue("approverPassword", "");
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The sale couldn't be voided. Try again.") });
    },
  });

  const handleSubmit = (values: ISaleVoidFormValues) =>
    voidMutation.mutate({
      id: sale.id,
      reason: values.reason.trim(),
      approver: needsApproval
        ? { username: values.approverUsername?.trim() ?? "", password: values.approverPassword ?? "" }
        : null,
    });

  return {
    form,
    needsApproval,
    reason,
    pickReason: (preset: string) => form.setFields([{ name: "reason", value: preset, errors: [] }]),
    handleSubmit,
    handleBack: onBack,
    isVoiding: voidMutation.isLoading,
  };
};
