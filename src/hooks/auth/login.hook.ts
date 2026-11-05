import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import AuthenticationService from "../../services/auth/auth.service";
import StoreSettingsService from "../../services/store-settings.service";
import type { IPasswordLoginRequest } from "../../models/auth/authentication.request";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import { useAuthStore } from "../../stores/common/auth.store";
import { useThemeStore } from "../../stores/common/theme.store";
import { PIN_MAX_LENGTH, useLoginStore } from "../../stores/data/login.store";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";
import { Toast } from "../../utils/http_service";
import { PUBLIC_STORE_SETTINGS_KEY } from "../store-settings/store-settings.hook";

export const PIN_MIN_LENGTH = 4;

const errorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error?.response?.data?.message ?? (error?.response ? fallback : "The POS server can't be reached. Check that it's running.");

export const useLoginHook = () => {
  const navigate = useNavigate();
  const [passwordForm] = Form.useForm<IPasswordLoginRequest>();
  const setToken = useAuthStore((state) => state.setToken);
  const applyBranding = useThemeStore((state) => state.applyBranding);
  const { method, pin, pinRejected, lampOn, setMethod, pressDigit, backspace, clearPin, setPinRejected, toggleLamp } =
    useLoginStore();

  // The store's name, logo and colors, so the sign-in screen already looks like the store.
  const publicSettingsQuery = useQuery({
    queryKey: PUBLIC_STORE_SETTINGS_KEY,
    queryFn: StoreSettingsService.getPublicSettings,
  });
  const { data: storeBranding } = publicSettingsQuery;

  useEffect(() => {
    if (!storeBranding) return;
    applyBranding({
      theme: storeBranding.theme,
      customColor: storeBranding.customColor,
      mode: storeBranding.mode,
      corners: storeBranding.corners,
      textSize: storeBranding.textSize,
    });
  }, [storeBranding, applyBranding]);

  const onSignedIn = (response: IUserAccountResponse) => {
    // Setting the token enables the get-me query (view.hook), which loads the account.
    setToken(response.tokenInfo.token);
    navigate(CONSTANT_ROUTES.home, { replace: true });
  };

  const pinMutation = useMutation({
    mutationFn: AuthenticationService.loginWithPin,
    onSuccess: onSignedIn,
    onError: (error: AxiosError<{ message?: string }>) => {
      setPinRejected(true);
      clearPin();
      Toast.fire({ icon: "error", title: errorMessage(error, "That PIN didn't work. Try again.") });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: AuthenticationService.login,
    onSuccess: onSignedIn,
    onError: (error: AxiosError<{ message?: string }>) => {
      passwordForm.setFieldValue("password", "");
      Toast.fire({ icon: "error", title: errorMessage(error, "Sign-in failed. Try again.") });
    },
  });

  const submitPin = () => {
    if (pin.length < PIN_MIN_LENGTH || pinMutation.isLoading) return;
    pinMutation.mutate({ pin });
  };

  const onPasswordFinish = (values: IPasswordLoginRequest) =>
    passwordMutation.mutate({ username: values.username.trim(), password: values.password });

  // The PIN pad works from the keyboard: digits, Backspace, Escape to clear, Enter to sign in.
  useEffect(() => {
    if (method !== "pin") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Escape") clearPin();
      else if (e.key === "Enter") submitPin();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // A rejected PIN shakes the dots once, then settles.
  useEffect(() => {
    if (!pinRejected) return;
    const id = window.setTimeout(() => setPinRejected(false), 600);
    return () => window.clearTimeout(id);
  }, [pinRejected, setPinRejected]);

  return {
    storeBranding,
    method,
    setMethod,
    pin,
    pinRejected,
    pinMaxLength: PIN_MAX_LENGTH,
    canSubmitPin: pin.length >= PIN_MIN_LENGTH,
    pressDigit,
    backspace,
    clearPin,
    submitPin,
    isPinLoading: pinMutation.isLoading,
    passwordForm,
    onPasswordFinish,
    isPasswordLoading: passwordMutation.isLoading,
    lampOn,
    toggleLamp,
  };
};
