import { useViewHook } from "./hooks/view/view.hook";
import LoadingScreen from "./common/screen/LoadingScreen";
import { Route, Routes } from "react-router-dom";
import PageNotFoundLayout from "./layouts/PageNotFoundLayout";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { ProtectedRoutes, PublicRoutes } from "./routes/allroutes";
import { flattenRoutes } from "./utils/route.util";
import { useAuthStore } from "./stores/common/auth.store";
import type { UserRoleEnum } from "./enums/user-role.enum";
import Forbidden from "./components/auth/Forbidden";

// AMGC POS signs people in itself (Login page), so there is no portal ?token=
// hand-off and no separate unauthorized branch: no token means the login page.
const View = () => {
  const { getMeQuery } = useViewHook();
  const userAccount = useAuthStore((state) => state.userAccount);

  // A page whose role list the user has none of shows 403, the same check the
  // side menu uses to hide it (filterRoutesByRole).
  const accessLevels = userAccount?.tokenInfo?.accessLevels?.map((x) => x.code as unknown as UserRoleEnum);
  const isForbidden = (role?: UserRoleEnum[]) => !!role && !!accessLevels && !role.some((r) => accessLevels.includes(r));

  return (
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
  );
};

export default View;
