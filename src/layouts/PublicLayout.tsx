import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/common/auth.store";
import { CONSTANT_ROUTES } from "../constants/constantRoutes";

const PublicLayout = () => {
  const { getToken } = useAuthStore();

  if (getToken()) return <Navigate to={CONSTANT_ROUTES.home} replace />;

  return <Outlet />;
};

export default PublicLayout;
