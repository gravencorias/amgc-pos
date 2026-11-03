import { Alert, Col, Row, Skeleton } from "antd";
import { HomeIcon } from "../../assets/icons/Icons";
import PageHeader from "../../components/common/PageHeader";
import ComingNext from "../../components/home/ComingNext";
import SetupChecklist from "../../components/home/SetupChecklist";
import { useHomeHook } from "../../hooks/home/home.hook";
import { getGreeting } from "../../utils/helpers";

const Home = () => {
  const { userAccount, settings, isLoading, isManager, setupSteps, doneCount, goTo } = useHomeHook();
  const firstName = userAccount.userInfo?.fullName?.split(" ")[0] ?? "";

  return (
    <div>
      <PageHeader
        icon={HomeIcon}
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ""}`}
        description={settings ? `Signed in to ${settings.storeName} as ${userAccount.userInfo?.roleName ?? "staff"}.` : undefined}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          {isLoading || !settings ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : isManager ? (
            <SetupChecklist storeName={settings.storeName} steps={setupSteps} doneCount={doneCount} onOpen={goTo} />
          ) : (
            <Alert
              type="info"
              showIcon
              message="The register is on its way"
              description="Checkout is the next part of AMGC POS being built. Until then, there's nothing to do here for cashiers."
            />
          )}
        </Col>
        <Col xs={24} xl={10}>
          <ComingNext />
        </Col>
      </Row>
    </div>
  );
};

export default Home;
