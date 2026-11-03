import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Only an owner or manager can open this page"
      subTitle="Ask your manager to sign in if something here needs changing."
      extra={
        <Button type="primary" size="large" onClick={() => navigate(CONSTANT_ROUTES.home)}>
          Back to home
        </Button>
      }
    />
  );
};

export default Forbidden;
