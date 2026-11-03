import { Layout, Typography } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, Navigate } from "react-router-dom";
import { CONSTANT_ROUTES } from "../constants/constantRoutes";
import { useAuthStore } from "../stores/common/auth.store";
import { useThemeStore } from "../stores/common/theme.store";
import ProtectedSideNavigation from "../components/protected/ProtectedSideNavigation";
import ProtectedTopHeading from "../components/protected/ProtectedTopHeading";
import useWindowSize from "../hooks/window/window.size.hook";
import { useStoreSettingsHook } from "../hooks/store-settings/store-settings.hook";
import Modal from "../components/common/modals/Modal";
import Drawer from "../components/common/drawers/Drawer";

const { Text } = Typography;

const ProtectedLayout = () => {
  const windowSize = useWindowSize();
  const { getToken, userAccount } = useAuthStore();
  const { siderCollapse, setSiderCollapse } = useThemeStore();
  // Loads the store's settings once for every page and applies its branding.
  const { storeSettingsQuery } = useStoreSettingsHook();

  if (!getToken()) return <Navigate to={CONSTANT_ROUTES.login} replace />;

  return (
    <>
      <Layout className="h-screen overflow-hidden">
        {/* Hidden below lg; the menu button in ProtectedTopHeading opens the same navigation in a Drawer. */}
        <Sider
          collapsible
          collapsed={siderCollapse}
          onCollapse={(value) => setSiderCollapse(value)}
          width={windowSize !== "xxxl" ? 280 : 320}
          collapsedWidth={88}
          trigger={null}
          theme="light"
          className="hidden lg:block !bg-[var(--amgc-bg-surface)] border-r border-solid border-0 border-[var(--amgc-border)] overflow-y-auto"
        >
          <ProtectedSideNavigation
            userAccount={userAccount}
            storeSettings={storeSettingsQuery.data}
            isCollapsed={siderCollapse}
            setIsCollapsed={setSiderCollapse}
          />
        </Sider>

        <Layout className="h-screen overflow-hidden min-h-0">
          <ProtectedTopHeading storeSettings={storeSettingsQuery.data} />
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <Content className="p-5 md:p-8 flex-1 !min-h-[auto]">
              <Outlet />
            </Content>
            <Footer className="!bg-[var(--amgc-bg-surface)] border-solid border-0 border-t border-[var(--amgc-border)] px-5 py-3 md:px-8">
              <Text className="!text-[var(--amgc-text-muted)] text-xs sm:text-sm">AMGC POS © 2026</Text>
            </Footer>
          </div>
        </Layout>
      </Layout>

      {/* Modal & Drawer */}
      <Modal />
      <Drawer />
    </>
  );
};

export default ProtectedLayout;
