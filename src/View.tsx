import { useViewHook } from "./hooks/view/view.hook";
import LoadingScreen from "./common/screen/LoadingScreen";
import OfflineScreen from "./common/status/OfflineScreen";
import { Route, Routes } from "react-router-dom";
import PageNotFoundLayout from "./layouts/PageNotFoundLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { ProtectedRoutes, PublicRoutes } from "./routes/allroutes";
import { flattenRoutes } from "./utils/route.util";
import { useAuthStore } from "./stores/common/auth.store";
import type { UserRoleEnum } from "./enums/user-role.enum";
import Forbidden from "./components/auth/Forbidden";
import ConnectServer from "./pages/connect/ConnectServer";
import AppUpdateBanner from "./components/common/AppUpdateBanner";
import { useServerStore } from "./stores/common/server.store";
import { useAppUpdateHook } from "./hooks/app/app-update.hook";
import { isNativeApp } from "./utils/native.util";

// AMGC POS signs people in itself (Login page), so there is no portal ?token=
// hand-off and no separate unauthorized branch: no token means the login page.
const View = () => {
  const { getMeQuery } = useViewHook();
  const userAccount = useAuthStore((state) => state.userAccount);

  // A page whose role list the user has none of shows 403, the same check the
  // side menu uses to hide it (filterRoutesByRole).
  const roles = userAccount?.tokenInfo?.roles?.map((x) => x.access as UserRoleEnum);
  const isForbidden = (role?: UserRoleEnum[]) => !!role && !!roles && !role.some((r) => roles.includes(r));

  // The Android app first needs the store's server (the Connect screen), and says when its
  // version no longer matches the server's. A browser register needs neither.
  const needsServer = useServerStore((state) => isNativeApp && (!state.serverUrl || state.isChanging));
  const update = useAppUpdateHook();

  if (needsServer) return <ConnectServer />;

  return (
    <>
      <LoadingScreen visible={getMeQuery.isFetching}>
        <Routes>
          <Route element={<PublicLayout />}>
            {flattenRoutes(PublicRoutes).map(({ key, path, component: Component }) => {
              if (Component) return <Route key={key} path={path} element={<Component />} />;
            })}
          </Route>

          <Route path="/" element={<ProtectedLayout />}>
            {flattenRoutes(ProtectedRoutes).map(({ key, path, role, component: Component }) => {
              if (Component)
                return <Route key={key} path={path} element={isForbidden(role) ? <Forbidden /> : <Component />} />;
            })}
          </Route>

          <Route path="*" element={<PageNotFoundLayout />} />
        </Routes>
      </LoadingScreen>

      {/* Outside the routes and the loading screen, over both: an outage can happen on any
          page, or before the first one has loaded. */}
      <OfflineScreen />
      {update.isMismatch && (
        <AppUpdateBanner appVersion={update.appVersion} serverVersion={update.serverVersion} onDownload={update.download} />
      )}
    </>
  );
};

export default View;
