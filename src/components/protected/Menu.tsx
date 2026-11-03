import { Menu as AntMenu } from "antd";
import type { MenuProps } from "antd";
import type { CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { IRoute } from "../../models/common/route.model";
import { filterOutHiddenMenuRoutes, filterRoutesByRole } from "../../utils/route.util";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import type { UserRoleEnum } from "../../enums/user-role.enum";
import { useDrawerStore } from "../../stores/common/drawer.store";

interface IProps {
  userAccount: IUserAccountResponse;
  isCollapsed: boolean | undefined;
  protectedRoutes: IRoute[];
}

const Menu = ({ userAccount, isCollapsed, protectedRoutes }: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const closeDrawer = useDrawerStore((state) => state.closeDrawer);

  const roleFilteredRoutes = filterRoutesByRole(
    protectedRoutes,
    (userAccount.tokenInfo?.accessLevels ?? []).map((x) => x.code as unknown as UserRoleEnum),
  );
  const menuRoutes = filterOutHiddenMenuRoutes(roleFilteredRoutes);

  const go = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  return (
    <AntMenu
      key={isCollapsed ? "collapsed" : "expanded"}
      className="amgc-menu !border-none !bg-transparent"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={isCollapsed ? [] : menuRoutes.filter((r) => r.children).map((r) => r.key)}
      // "light" in both modes: the dark algorithm already darkens it. theme="dark" would
      // switch to antd's own navy menu palette instead of the store's surfaces.
      theme="light"
      mode={isCollapsed ? "vertical" : "inline"}
      inlineCollapsed={isCollapsed}
      items={menuRoutes.map(({ icon: Icon, children, ...item }, index): NonNullable<MenuProps["items"]>[number] => {
        const style = { "--menu-item-index": index } as CSSProperties;

        if (children && children.length > 0) {
          return {
            key: item.key,
            icon: Icon ? <Icon size={18} /> : null,
            label: item.name,
            className: "amgc-menu-item-slide",
            style,
            children: children.map((child) => ({
              key: child.path!,
              label: child.name,
              onClick: () => go(child.path!),
            })) as NonNullable<MenuProps["items"]>,
          };
        }

        return {
          key: item.path!,
          icon: Icon ? <Icon size={18} /> : null,
          label: item.name,
          className: "amgc-menu-item-slide",
          style,
          onClick: () => go(item.path!),
        };
      })}
    />
  );
};

export default Menu;
