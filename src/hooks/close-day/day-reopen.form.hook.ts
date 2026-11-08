import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import DayCloseService from "../../services/day-close.service";
import type { IDayReopenFormValues } from "../../models/day-close/day-close.request.model";
import type { IDayCloseResponse } from "../../models/day-close/day-close.response.model";
import { DAY_CLOSE_CURRENT_KEY, DAY_CLOSE_LIST_KEY, DAY_CLOSE_TODAY_KEY } from "../../constants/constantQueryKeys";
import { Toast } from "../../utils/http_service";
import { isTouchMode } from "../../utils/touch.util";
import { getApiErrorMessage } from "../../utils/helpers";
import { formatLongDate } from "../../utils/date.util";

export interface IDayReopenFormProps {
  dayClose: IDayCloseResponse;
  // Back to the Z reading, without reopening.
  onBack: () => void;
  onReopened: () => void;
}

// Reopens the latest closed day, for a closing made by mistake. Owner only; the API
// checks that too. The Z reading stays on record, marked reopened.
export const useDayReopenFormHook = ({ dayClose, onBack, onReopened }: IDayReopenFormProps) => {
  const [form] = Form.useForm<IDayReopenFormValues>();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setFieldsValue({ reason: "" });
  }, [form]);

  // antd's Modal takes focus as it opens, which beats autoFocus, so focus the box once it has.
  // Not in touch mode, where the on-screen keyboard would cover the dialog; a tap on the box opens it.
  useEffect(() => {
    if (isTouchMode()) return;
    const id = window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".ant-modal textarea.amgc-focus-first")?.focus(), 120);
    return () => window.clearTimeout(id);
  }, []);

  const reopenMutation = useMutation({
    mutationFn: DayCloseService.reopen,
    onSuccess: (reopened: IDayCloseResponse) => {
      // The day is due again, and the Register can sell again if it's today.
      queryClient.invalidateQueries(DAY_CLOSE_CURRENT_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_LIST_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_TODAY_KEY);
      Toast.fire({ icon: "success", title: `${formatLongDate(reopened.date)} is open again.` });
      onReopened();
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The day couldn't be reopened. Try again.") }),
  });

  return {
    form,
    handleSubmit: (values: IDayReopenFormValues) => reopenMutation.mutate({ id: dayClose.id, reason: values.reason.trim() }),
    handleBack: onBack,
    isReopening: reopenMutation.isLoading,
  };
};
