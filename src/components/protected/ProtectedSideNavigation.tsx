import { Avatar, Button, Tooltip, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CollapseIcon, ExpandIcon } from "../../assets/icons/Icons";
import { CONSTANT_ROUTES } from "../../constants/constantRoutes";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { ProtectedRoutes } from "../../routes/allroutes";
import { getInitials } from "../../utils/helpers";
import Menu from "./Menu";

const { Text } = Typography;

interface IProps {
  userAccount: IUserAccountResponse;
  storeSettings?: IStoreSettingsResponse;
  isCollapsed?: boolean;
  setIsCollapsed?: (isCollapsed: boolean) => void;
}

const ProtectedSideNavigation = ({ userAccount, storeSettings, isCollapsed, setIsCollapsed }: IProps) => {
  const navigate = useNavigate();
  const storeName = storeSettings?.storeName ?? "";
  const user = userAccount.userInfo;

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className={`flex items-center gap-3 ${isCollapsed ? "flex-col" : ""}`}>
        <button
          type="button"
          className="amgc-store-mark"
          onClick={() => navigate(CONSTANT_ROUTES.home)}
          aria-label={`${storeName || "Store"} home`}
        >
          {storeSettings?.logoUrl ? <img src={storeSettings.logoUrl} alt="" /> : getInitials(storeName || "AMGC POS")}
        </button>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <Text strong className="block truncate !text-[16px]">
              {storeName || "Your store"}
            </Text>
            <Text className="block !text-xs !text-[var(--amgc-text-muted)]">AMGC POS</Text>
          </div>
        )}
        {setIsCollapsed && (
          <Tooltip title={isCollapsed ? "Expand menu" : "Collapse menu"} placement="right">
            <Button
              type="text"
              aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
              icon={isCollapsed ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </Tooltip>
        )}
      </div>

      <div className="mt-4 flex-1">
        <Menu userAccount={userAccount} isCollapsed={isCollapsed} protectedRoutes={ProtectedRoutes} />
      </div>

      <div
        className={`flex items-center gap-3 rounded-xl border border-solid border-[var(--amgc-border)] p-3 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        <Avatar className="!bg-primary !text-[var(--amgc-on-primary)] shrink-0 font-semibold">
          {getInitials(user?.fullName)}
        </Avatar>
        {!isCollapsed && (
          <div className="min-w-0">
            <Text strong className="block truncate">
              {user?.fullName}
            </Text>
            <Text className="block !text-xs !text-[var(--amgc-text-muted)]">{user?.roleName}</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedSideNavigation;
