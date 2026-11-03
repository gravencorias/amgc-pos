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

export const useStoreDetailsFormHook = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IStoreDetailsFormValues>();
  const storeSettingsQuery = useStoreSettingsQuery();
  const { data } = storeSettingsQuery;

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

  const onFinish = (values: IStoreDetailsFormValues) => {
    if (!data) return;
    updateMutation.mutate({
      ...toStoreSettingsRequest(data),
      storeName: values.storeName.trim(),
      tagline: emptyToNull(values.tagline),
      address: emptyToNull(values.address),
      tin: emptyToNull(values.tin),
      vatRegistered: values.vatRegistered,
      receiptFooter: emptyToNull(values.receiptFooter),
      showLogoOnReceipt: values.showLogoOnReceipt,
    });
  };

  return {
    form,
    storeSettings: data,
    isLoading: storeSettingsQuery.isLoading,
    onFinish,
    isSaving: updateMutation.isLoading,
  };
};
