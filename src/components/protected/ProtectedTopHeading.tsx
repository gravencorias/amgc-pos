import { Button, Typography } from "antd";
import { LockIcon, LogoutIcon, MenuIcon } from "../../assets/icons/Icons";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { useAuthStore } from "../../stores/common/auth.store";
import { useDrawerStore } from "../../stores/common/drawer.store";
import useClock from "../../hooks/clock/clock.hook";
import { checkIfManager } from "../../utils/roleChecker";
import ProtectedSideNavigation from "./ProtectedSideNavigation";

const { Text } = Typography;

interface IProps {
  storeSettings?: IStoreSettingsResponse;
}

const ProtectedTopHeading = ({ storeSettings }: IProps) => {
  const { userAccount, logout } = useAuthStore();
  const { showDrawer } = useDrawerStore();
  const isManager = checkIfManager(userAccount.tokenInfo?.accessLevels);
  const currentTime = useClock();

  return (
    <div className="flex w-full items-center justify-between gap-4 border-0 border-b border-solid border-[var(--amgc-border)] bg-[var(--amgc-bg-surface)] px-5 py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className="lg:!hidden"
          size="large"
          aria-label="Open menu"
          icon={<MenuIcon size={20} />}
          onClick={() =>
            showDrawer({
              properties: { placement: "left", open: true, closable: false, width: 300 },
              body: <ProtectedSideNavigation userAccount={userAccount} storeSettings={storeSettings} />,
            })
          }
        />
        <Text className="truncate !text-[var(--amgc-text-muted)]">
          {/* Philippine date and time; useClock re-renders each minute, so the date turns over at midnight too. */}
          {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Manila" })}
          {` · ${currentTime}`}
        </Text>
      </div>

      {/* Cashiers hand over the register with "Switch cashier"; owners and managers sign out. */}
      <Button size="large" icon={isManager ? <LogoutIcon size={18} /> : <LockIcon size={18} />} onClick={logout}>
        {isManager ? "Sign out" : "Switch cashier"}
      </Button>
    </div>
  );
};

export default ProtectedTopHeading;
