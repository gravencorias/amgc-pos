import { Button, Result } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/common/auth.store";
import { CONSTANT_ROUTES } from "../constants/constantRoutes";

const PageNotFoundLayout = () => {
  const { getToken } = useAuthStore();
  const navigate = useNavigate();

  // Signed out: the sign-in page is the one to show, not the missing page.
  if (!getToken()) return <Navigate to={CONSTANT_ROUTES.login} replace />;

  return (
    <div className="flex h-[100vh] items-center justify-center bg-[var(--amgc-bg-layout)]">
      <Result
        status="404"
        title="We can't find that page"
        subTitle="The link may be wrong, or the page was moved."
        extra={
          <Button type="primary" size="large" onClick={() => navigate(CONSTANT_ROUTES.home)}>
            Back to home
          </Button>
        }
      />
    </div>
  );
};

export default PageNotFoundLayout;
