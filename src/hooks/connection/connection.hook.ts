import { useCallback, useEffect } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { selectOfflineReason, useConnectionStore, type ServiceDownStatus } from "../../stores/common/connection.store";
import { serviceDownStatus } from "../../utils/http_service";

// How often to try again on its own while the offline screen is up.
const AUTO_RETRY_MS = 20_000;
const PROBE_TIMEOUT_MS = 8_000;

type ProbeResult = "ok" | "unreachable" | ServiceDownStatus;

// The public store-settings route: it needs no token and always answers when the store's
// server is up. A fresh axios instance, NOT the global one from utils/http_service.ts, so no
// token is sent and its 401 handling can't fire on a probe. The address comes from the global
// instance's baseURL, which is VITE_API_URL today and the saved store server in the Android app.
const probe = axios.create();
const probeApi = async (): Promise<ProbeResult> => {
  const base = String(axios.defaults.baseURL ?? "/api/");
  try {
    await probe.get(`${base.endsWith("/") ? base : `${base}/`}store-settings/public`, { timeout: PROBE_TIMEOUT_MS });
    return "ok";
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) return "unreachable";
    return serviceDownStatus(error.response.status) ?? "ok";
  }
};

// THE APP'S CONNECTION: whether to show the offline screen, which version of it, and its
// retry. Ported from dcwd_erp-hr-payroll (which took it from dcwd_erp-hr-attendance).
export const useConnectionHook = () => {
  const queryClient = useQueryClient();
  const reason = useConnectionStore(selectOfflineReason);
  const lastConnectedAt = useConnectionStore((state) => state.lastConnectedAt);
  const isChecking = useConnectionStore((state) => state.isChecking);
  const isOffline = reason !== null;

  // On success the data the outage broke is fetched again: the screens under the offline
  // screen stayed mounted, so they simply fill back in.
  const retry = useCallback(async () => {
    const { setBrowserOnline, setIsChecking, markReachable, markUnreachable, markServiceDown } =
      useConnectionStore.getState();

    if (!navigator.onLine) {
      setBrowserOnline(false);
      return;
    }

    setIsChecking(true);
    const result = await probeApi();
    setIsChecking(false);

    setBrowserOnline(true);
    if (result === "ok") {
      markReachable();
      queryClient.refetchQueries({ type: "active" });
    } else if (result === "unreachable") {
      markUnreachable();
    } else {
      markServiceDown(result);
    }
  }, [queryClient]);

  // The browser's own signal. Coming back online isn't proof the store's server is
  // reachable, so it checks rather than clearing the screen outright.
  useEffect(() => {
    const { setBrowserOnline } = useConnectionStore.getState();
    const handleOnline = () => {
      setBrowserOnline(true);
      void retry();
    };
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [retry]);

  // While the screen is up, keep checking quietly so it clears by itself.
  useEffect(() => {
    if (!isOffline) return;
    const interval = setInterval(() => void retry(), AUTO_RETRY_MS);
    return () => clearInterval(interval);
  }, [isOffline, retry]);

  return { isOffline, reason, lastConnectedAt, isChecking, retry };
};
