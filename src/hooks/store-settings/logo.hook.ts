import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import StoreSettingsService from "../../services/store-settings.service";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { resizeImageToSquare } from "../../utils/image_resize";
import { PUBLIC_STORE_SETTINGS_KEY, STORE_SETTINGS_KEY } from "./store-settings.hook";

// Called once on the Branding page; LogoUploader gets the handlers as props.
export const useLogoHook = () => {
  const queryClient = useQueryClient();

  const onSaved = (response: IStoreSettingsResponse, message: string) => {
    queryClient.setQueryData(STORE_SETTINGS_KEY, response);
    queryClient.invalidateQueries(PUBLIC_STORE_SETTINGS_KEY);
    Toast.fire({ icon: "success", title: message });
  };
  const onFailed = (error: AxiosError<{ message?: string }>, fallback: string) =>
    Toast.fire({ icon: "error", title: error?.response?.data?.message ?? fallback });

  const uploadMutation = useMutation({
    mutationFn: StoreSettingsService.uploadLogo,
    onSuccess: (response: IStoreSettingsResponse) => onSaved(response, "Logo updated"),
    onError: (error: AxiosError<{ message?: string }>) => onFailed(error, "The logo couldn't be uploaded."),
  });

  const removeMutation = useMutation({
    mutationFn: StoreSettingsService.removeLogo,
    onSuccess: (response: IStoreSettingsResponse) => onSaved(response, "Logo removed"),
    onError: (error: AxiosError<{ message?: string }>) => onFailed(error, "The logo couldn't be removed."),
  });

  // antd Upload's beforeUpload: resize in the browser, upload ourselves, and stop antd's own request.
  const beforeUpload = (file: File) => {
    resizeImageToSquare(file)
      .then((blob) => uploadMutation.mutate(blob))
      .catch((error: Error) => Toast.fire({ icon: "error", title: error.message }));
    return false;
  };

  const removeLogo = async () => {
    const { isConfirmed } = await showPopConfirmation({
      title: "Remove the logo?",
      text: "The register and receipts will show the store's initials instead.",
      confirmButtonText: "Remove logo",
    });
    if (isConfirmed) removeMutation.mutate();
  };

  return {
    beforeUpload,
    removeLogo,
    isUploading: uploadMutation.isLoading,
    isRemoving: removeMutation.isLoading,
  };
};
