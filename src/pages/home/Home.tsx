import { Button, Card, Col, Row, Skeleton, Typography } from "antd";
import { HomeIcon, RegisterIcon } from "../../assets/icons/Icons";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";
import PageHeader from "../../components/common/PageHeader";
import SetupChecklist from "../../components/home/SetupChecklist";
import TodaySnapshot from "../../components/home/TodaySnapshot";
import { useHomeHook } from "../../hooks/home/home.hook";
import { getGreeting } from "../../utils/helpers";

const { Text } = Typography;

const Home = () => {
  const { userAccount, settings, isLoading, isManager, todaySummary, isLoadingToday, setupSteps, doneCount, goTo } =
    useHomeHook();
  const firstName = userAccount.userInfo?.fullName?.split(" ")[0] ?? "";

  return (
    <div>
      <PageHeader
        icon={HomeIcon}
        title={`${getGreeting()}${firstName ? `, ${firstName}` : ""}`}
        description={settings ? `Signed in to ${settings.storeName} as ${userAccount.userInfo?.roleName ?? "staff"}.` : undefined}
        extra={
          <Button type="primary" size="large" icon={<RegisterIcon size={18} />} onClick={() => goTo(CONSTANT_ROUTES.register)}>
            Open the register
          </Button>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={isManager ? 14 : 24}>
          {isLoading || !settings ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : isManager ? (
            <SetupChecklist storeName={settings.storeName} steps={setupSteps} doneCount={doneCount} onOpen={goTo} />
          ) : (
            <Card title="Ready to sell">
              <Text className="mb-4 block !text-[var(--amgc-text-muted)]">
                Open the register to start taking orders. Type a product's name and press Enter to add it, and F9 to
                charge.
              </Text>
              <Button type="primary" size="large" onClick={() => goTo(CONSTANT_ROUTES.register)}>
                Open the register
              </Button>
            </Card>
          )}
        </Col>
        {isManager && (
          <Col xs={24} xl={10}>
            <TodaySnapshot
              summary={todaySummary}
              isLoading={isLoadingToday}
              onOpenSales={() => goTo(CONSTANT_ROUTES.sales)}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Home;
