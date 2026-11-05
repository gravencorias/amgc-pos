import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import StoreSettingsService from "../../services/store-settings.service";
import type { IStoreDetailsFormValues } from "../../models/store-settings/store-settings.request.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { Toast } from "../../utils/http_service";
import { emptyToNull, toStoreSettingsRequest } from "../../utils/store-settings.util";
import { PUBLIC_STORE_SETTINGS_KEY, STORE_SETTINGS_KEY, useStoreSettingsQuery } from "./store-settings.hook";

// The details as they'd be saved: trimmed, with empty optional text as null.
const toDetails = (values: Partial<IStoreDetailsFormValues>) => ({
  storeName: (values.storeName ?? "").trim(),
  tagline: emptyToNull(values.tagline),
  address: emptyToNull(values.address),
  tin: emptyToNull(values.tin),
  vatRegistered: !!values.vatRegistered,
  receiptFooter: emptyToNull(values.receiptFooter),
  showLogoOnReceipt: !!values.showLogoOnReceipt,
});

export const useStoreDetailsFormHook = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IStoreDetailsFormValues>();
  const storeSettingsQuery = useStoreSettingsQuery();
  const { data } = storeSettingsQuery;

  // The receipt preview follows the form, saved or not.
  const values = Form.useWatch([], form) as Partial<IStoreDetailsFormValues> | undefined;

  // Synced off `data` (not onSuccess) so cached settings fill the form too.
  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      storeName: data.storeName,
      tagline: data.tagline,
      address: data.address,
      tin: data.tin,
      vatRegistered: data.vatRegistered,
      receiptFooter: data.receiptFooter,
      showLogoOnReceipt: data.showLogoOnReceipt,
    });
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: StoreSettingsService.updateSettings,
    onSuccess: (response: IStoreSettingsResponse) => {
      queryClient.setQueryData(STORE_SETTINGS_KEY, response);
      queryClient.invalidateQueries(PUBLIC_STORE_SETTINGS_KEY);
      Toast.fire({ icon: "success", title: "Store details saved" });
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title: string }[] }>) => {
      const body = error?.response?.data;
      Toast.fire({
        icon: "error",
        title: body?.errors?.[0]?.title ?? body?.message ?? "The store details couldn't be saved.",
      });
    },
  });

  const onFinish = (formValues: IStoreDetailsFormValues) => {
    if (!data) return;
    updateMutation.mutate({ ...toStoreSettingsRequest(data), ...toDetails(formValues) });
  };

  // Save stays off until a field differs from what's saved, compared the way it would be sent.
  const isDirty = (() => {
    if (!data || !values) return false;
    const saved = toDetails(data);
    const current = toDetails(values);
    return (Object.keys(saved) as (keyof typeof saved)[]).some((key) => saved[key] !== current[key]);
  })();

  return {
    form,
    storeSettings: data,
    values,
    isDirty,
    isLoading: storeSettingsQuery.isLoading,
    onFinish,
    isSaving: updateMutation.isLoading,
  };
};
