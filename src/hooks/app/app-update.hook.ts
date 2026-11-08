import { useQuery } from "@tanstack/react-query";
import SystemService from "../../services/system.service";
import { useServerStore } from "../../stores/common/server.store";
import { APP_VERSION, isNativeApp } from "../../utils/native.util";

export const VERSION_KEY = ["system-version"];

// THE ANDROID APP'S UPDATE CHECK. The APK carries its own copy of the screens, so after the store
// PC is updated, every tablet needs the new APK too. When the server's version differs from this
// app's, the banner (AppUpdateBanner) says so and links to the APK on the server. A browser
// register always runs the server's own copy, so it never asks.
export const useAppUpdateHook = () => {
  const serverUrl = useServerStore((state) => state.serverUrl);

  const versionQuery = useQuery({
    queryKey: VERSION_KEY,
    queryFn: SystemService.getVersion,
    enabled: isNativeApp && !!serverUrl,
    // Checked again every 10 minutes: the store PC is often updated while tablets stay open.
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const server = versionQuery.data;
  const isMismatch =
    !!server && server.version !== "dev" && APP_VERSION !== "dev" && server.version !== APP_VERSION;

  return {
    isMismatch,
    appVersion: APP_VERSION,
    serverVersion: server?.version,
    // Opening the server's address leaves the app for the tablet's browser, which downloads
    // the APK and offers to install it over this one.
    download:
      serverUrl && server?.androidAppPath
        ? () => {
            window.location.href = `${serverUrl}${server.androidAppPath}`;
          }
        : undefined,
  };
};
