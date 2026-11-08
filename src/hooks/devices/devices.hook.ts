import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import SystemService from "../../services/system.service";
import { useDevicesStore } from "../../stores/data/devices.store";
import { useDeviceStore } from "../../stores/common/device.store";
import { usePrinterStore } from "../../stores/common/printer.store";
import useTouchMode, { useCoarsePointer } from "../touch/touch.hook";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import { getApiErrorMessage } from "../../utils/helpers";
import { Toast } from "../../utils/http_service";
import { isNativeApp } from "../../utils/native.util";
import { testPageBytes } from "../../utils/escpos";
import { printerErrorMessage, ReceiptPrinter, sendToPrinter } from "../../utils/receipt-printer.util";

export const SERVER_INFO_KEY = ["system-server-info"];
export const PAIRED_PRINTERS_KEY = ["paired-printers"];

// Settings > Devices: the QR codes tablets scan (the app's address and the Android app), and this
// device's own settings: touch mode and, in the Android app, its receipt printer.
export const useDevicesHook = () => {
  const selectedAddress = useDevicesStore((state) => state.selectedAddress);
  const setSelectedAddress = useDevicesStore((state) => state.setSelectedAddress);
  const touchMode = useDeviceStore((state) => state.touchMode);
  const setTouchMode = useDeviceStore((state) => state.setTouchMode);
  const printer = usePrinterStore((state) => state.printer);
  const setPrinter = usePrinterStore((state) => state.setPrinter);
  const openDrawer = usePrinterStore((state) => state.openDrawer);
  const setOpenDrawer = usePrinterStore((state) => state.setOpenDrawer);
  const isTouch = useTouchMode();
  const hasTouchscreen = useCoarsePointer();
  const { data: settings } = useStoreSettingsQuery();

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
  const androidAppPath = serverInfoQuery.data?.androidAppPath;

  // Paired Bluetooth devices, printers first. Android app only.
  const printersQuery = useQuery({
    queryKey: PAIRED_PRINTERS_KEY,
    queryFn: async () => {
      const { printers } = await ReceiptPrinter.listPrinters();
      return [...printers].sort((a, b) => Number(b.isPrinter) - Number(a.isPrinter) || a.name.localeCompare(b.name));
    },
    enabled: isNativeApp,
    staleTime: 0,
    onError: (error: unknown) => Toast.fire({ icon: "error", title: printerErrorMessage(error) }),
  });
  const devices = printersQuery.data ?? [];

  const testMutation = useMutation({
    mutationFn: () => sendToPrinter(testPageBytes(settings, printer?.name ?? "")),
    onSuccess: () => Toast.fire({ icon: "success", title: "Test page sent to the printer." }),
    onError: (error: unknown) => Toast.fire({ icon: "error", title: printerErrorMessage(error) }),
  });

  const selectPrinter = (address: string | undefined) => {
    const device = devices.find((d) => d.address === address);
    setPrinter(device ? { name: device.name, address: device.address } : null);
  };

  return {
    serverInfoQuery,
    addresses,
    selected,
    setSelectedAddress,
    apkUrl: selected && androidAppPath ? `${selected.url}${androidAppPath}` : undefined,
    serverVersion: serverInfoQuery.data?.version,
    touchMode,
    setTouchMode,
    isTouch,
    hasTouchscreen,
    isNativeApp,
    devices,
    isLoadingDevices: printersQuery.isFetching,
    refreshDevices: () => printersQuery.refetch(),
    printer,
    selectPrinter,
    openDrawer,
    setOpenDrawer,
    testPrint: () => testMutation.mutate(),
    isTesting: testMutation.isLoading,
  };
};
