import { Form } from "antd";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { CapacitorBarcodeScanner, CapacitorBarcodeScannerTypeHint } from "@capacitor/barcode-scanner";
import type { IPublicStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import type { IVersionResponse } from "../../models/system/system.response.model";
import { useConnectStore, type IFoundStore } from "../../stores/data/connect.store";
import { useServerStore } from "../../stores/common/server.store";
import { useAuthStore } from "../../stores/common/auth.store";
import { apiBaseFor, normalizeServerAddress } from "../../utils/server.util";
import { APP_VERSION } from "../../utils/native.util";
import { Toast } from "../../utils/http_service";

type IConnectFormValues = { address: string };

// A fresh axios instance: no token, no baseURL, and no 401 handling from http_service.
const probe = axios.create({ timeout: 8000 });

const findStore = async (serverUrl: string): Promise<IFoundStore> => {
  const base = apiBaseFor(serverUrl);
  const [settings, version] = await Promise.all([
    probe.get<IPublicStoreSettingsResponse>(`${base}store-settings/public`),
    // Older servers have no version route; that's only a missing detail.
    probe.get<IVersionResponse>(`${base}system/version`).catch(() => null),
  ]);
  if (!settings.data?.storeName) throw new Error("Not an AMGC POS server");
  return {
    serverUrl,
    storeName: settings.data.storeName,
    logoUrl: settings.data.logoUrl,
    version: version?.data?.version ?? null,
  };
};

// THE CONNECT SCREEN (Android app only): find the store's server by its QR code or address,
// show which store answered, and save it on this tablet.
export const useConnectHook = () => {
  const [form] = Form.useForm<IConnectFormValues>();
  const found = useConnectStore((state) => state.found);
  const setFound = useConnectStore((state) => state.setFound);
  const currentServer = useServerStore((state) => state.serverUrl);
  const isChanging = useServerStore((state) => state.isChanging);
  const saveServerUrl = useServerStore((state) => state.saveServerUrl);
  const cancelChange = useServerStore((state) => state.cancelChange);

  const findMutation = useMutation({
    mutationFn: findStore,
    onSuccess: (store: IFoundStore) => setFound(store),
    onError: () =>
      Toast.fire({
        icon: "error",
        title: "No store answered at that address. Check that this tablet is on the store's Wi-Fi and the main PC is on.",
      }),
  });

  const tryAddress = (input: string) => {
    const serverUrl = normalizeServerAddress(input);
    if (!serverUrl) {
      Toast.fire({ icon: "warning", title: "That isn't an address. It looks like 192.168.1.10:5000." });
      return;
    }
    form.setFieldValue("address", serverUrl.replace(/^http:\/\//, ""));
    findMutation.mutate(serverUrl);
  };

  const scan = async () => {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: "Point the camera at the QR code on the main PC: Settings → Devices.",
        scanButton: false,
      });
      if (result?.ScanResult) tryAddress(result.ScanResult);
    } catch {
      // Closed without scanning, or the camera was refused: typing the address still works.
    }
  };

  // A new server means a new store: drop the old sign-in and reload from the sign-in screen,
  // which paints the new store's branding.
  const confirm = () => {
    if (!found) return;
    saveServerUrl(found.serverUrl);
    setFound(null);
    useAuthStore.getState().logout();
  };

  const versionMismatch =
    !!found?.version && found.version !== "dev" && APP_VERSION !== "dev" && found.version !== APP_VERSION;

  return {
    form,
    found,
    isFinding: findMutation.isLoading,
    onFinish: (values: IConnectFormValues) => tryAddress(values.address),
    scan,
    confirm,
    back: () => setFound(null),
    // "Change server" from the sign-in screen can be cancelled back to the saved one.
    canCancel: isChanging && !!currentServer,
    currentServer,
    cancel: cancelChange,
    appVersion: APP_VERSION,
    versionMismatch,
  };
};
