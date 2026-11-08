import AuthenticationService from "../../services/auth/auth.service";
import type { AxiosError } from "axios";
import { recordSessionEnd, serviceDownStatus, Toast } from "../../utils/http_service";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/common/auth.store";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import { useServerStore } from "../../stores/common/server.store";
import { isNativeApp } from "../../utils/native.util";

// No portal ?token= capture here: AMGC POS signs people in on its own Login page.
export const useViewHook = () => {
  const { getToken, setToken, setUserAccount, setIsAuthenticated } = useAuthStore();
  // The Android app can't ask anyone until it knows the store's server (the Connect screen).
  const hasServer = useServerStore((state) => !isNativeApp || !!state.serverUrl);

  const getMeQuery = useQuery({
    queryKey: ["get-me"],
    queryFn: async () => await AuthenticationService.getMe(),
    enabled: !!getToken() && hasServer,
    onSuccess: (response: IUserAccountResponse) => {
      setUserAccount(response);
      setIsAuthenticated(!!response.tokenInfo.token);
    },
    onError: (error: AxiosError) => {
      // No answer at all, or the service saying it is down, is not a verdict on the token.
      if (!error?.response || serviceDownStatus(error.response.status)) return;

      Toast.fire({
        icon: "error",
        title: "Your session ended. Sign in again.",
      });
      // A 401 was already recorded and cleared by the http_service interceptor.
      if (useAuthStore.getState().getToken()) recordSessionEnd();
      setToken(null);
    },
  });

  return {
    getMeQuery,
    setToken,
  };
};
