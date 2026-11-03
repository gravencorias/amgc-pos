import { useEffect } from "react";
import { Form } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import StoreSettingsService from "../../services/store-settings.service";
import type { IBrandingFormValues } from "../../models/store-settings/store-settings.request.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { StoreThemeEnum } from "../../enums/branding.enum";
import { DEFAULT_CUSTOM_COLOR } from "../../constants/constantThemes";
import { Toast } from "../../utils/http_service";
import { toStoreSettingsRequest } from "../../utils/store-settings.util";
import { PUBLIC_STORE_SETTINGS_KEY, STORE_SETTINGS_KEY, useStoreSettingsQuery } from "./store-settings.hook";

export const useBrandingFormHook = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IBrandingFormValues>();
  const storeSettingsQuery = useStoreSettingsQuery();
  const { data } = storeSettingsQuery;

  // The live preview follows the form, saved or not.
  const watched = Form.useWatch([], form) as Partial<IBrandingFormValues> | undefined;

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      theme: data.theme,
      customColor: data.customColor ?? DEFAULT_CUSTOM_COLOR,
      mode: data.mode,
      corners: data.corners,
      textSize: data.textSize,
    });
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: StoreSettingsService.updateSettings,
    onSuccess: (response: IStoreSettingsResponse) => {
      // ProtectedLayout's useStoreSettingsHook re-applies the branding from this cache entry.
      queryClient.setQueryData(STORE_SETTINGS_KEY, response);
      queryClient.invalidateQueries(PUBLIC_STORE_SETTINGS_KEY);
      Toast.fire({ icon: "success", title: "Branding saved" });
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title: string }[] }>) => {
      const body = error?.response?.data;
      Toast.fire({ icon: "error", title: body?.errors?.[0]?.title ?? body?.message ?? "The branding couldn't be saved." });
    },
  });

  const onFinish = (values: IBrandingFormValues) => {
    if (!data) return;
    updateMutation.mutate({
      ...toStoreSettingsRequest(data),
      ...values,
      customColor: values.theme === StoreThemeEnum.custom ? values.customColor : data.customColor,
    });
  };

  const preview: IBrandingFormValues | undefined =
    data && watched?.theme
      ? {
          theme: watched.theme,
          customColor: watched.customColor ?? data.customColor,
          mode: watched.mode ?? data.mode,
          corners: watched.corners ?? data.corners,
          textSize: watched.textSize ?? data.textSize,
        }
      : undefined;

  const isDirty =
    !!data &&
    !!preview &&
    (preview.theme !== data.theme ||
      preview.mode !== data.mode ||
      preview.corners !== data.corners ||
      preview.textSize !== data.textSize ||
      (preview.theme === StoreThemeEnum.custom && preview.customColor !== data.customColor));

  return {
    form,
    storeSettings: data,
    preview,
    isDirty,
    isLoading: storeSettingsQuery.isLoading,
    onFinish,
    onReset: () => data && form.resetFields(),
    isSaving: updateMutation.isLoading,
  };
};
