import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import SystemService from "../../services/system.service";
import { useDevicesStore } from "../../stores/data/devices.store";
import { useDeviceStore } from "../../stores/common/device.store";
import useTouchMode, { useCoarsePointer } from "../touch/touch.hook";
import { getApiErrorMessage } from "../../utils/helpers";
import { Toast } from "../../utils/http_service";

export const SERVER_INFO_KEY = ["system-server-info"];

// Settings > Devices: the QR code tablets scan to open the app, and this device's touch mode.
export const useDevicesHook = () => {
  const selectedAddress = useDevicesStore((state) => state.selectedAddress);
  const setSelectedAddress = useDevicesStore((state) => state.setSelectedAddress);
  const touchMode = useDeviceStore((state) => state.touchMode);
  const setTouchMode = useDeviceStore((state) => state.setTouchMode);
  const isTouch = useTouchMode();
  const hasTouchscreen = useCoarsePointer();

  const serverInfoQuery = useQuery({
    queryKey: SERVER_INFO_KEY,
    queryFn: SystemService.getServerInfo,
    // The PC's address only changes when its network does; the Refresh button covers that.
    staleTime: Infinity,
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "This PC's network addresses couldn't be read.") }),
  });

  const addresses = serverInfoQuery.data?.addresses ?? [];
  // Derived, not synced: a stale pick (the PC changed networks) falls back to the first address.
  const selected = addresses.find((a) => a.address === selectedAddress) ?? addresses[0];

  return {
    serverInfoQuery,
    addresses,
    selected,
    setSelectedAddress,
    touchMode,
    setTouchMode,
    isTouch,
    hasTouchscreen,
  };
};
