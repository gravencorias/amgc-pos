import { Typography } from "antd";
import { Item, Menu, Separator } from "react-contexify";
import { EditIcon, KeyIcon, PowerIcon } from "../../assets/icons/Icons";
import { UserRoleEnum } from "../../enums/user-role.enum";
import type { IStaffPermissions } from "../../hooks/staff/staff.hook";
import type { IStaffResponse } from "../../models/staff/staff.response.model";

const { Text } = Typography;

type IProps = {
  id: string;
  record: IStaffResponse | null;
  permissions: IStaffPermissions;
  onEdit: (record: IStaffResponse) => void;
  onResetCredential: (record: IStaffResponse) => void;
  onSetActive: (record: IStaffResponse) => void;
};

// The row's actions. Items the signed-in person may not use stay visible but greyed
// out, with the reason underneath, so nobody wonders where an action went.
const StaffMenuList = ({ id, record, permissions, onEdit, onResetCredential, onSetActive }: IProps) => {
  const isCashier = record?.roleCode === UserRoleEnum.cashier;

  return (
    <Menu id={id} animation={false} className="amgc-row-menu">
      <Item disabled>
        <Text strong>{record?.fullName ?? "Actions"}</Text>
      </Item>

      <Item disabled={!permissions.canEdit} onClick={() => record && onEdit(record)}>
        <span className="amgc-row-menu__item">
          <EditIcon size={16} />
          Edit details
        </span>
      </Item>

      <Item disabled={!permissions.canResetCredential} onClick={() => record && onResetCredential(record)}>
        <span className="amgc-row-menu__item">
          <KeyIcon size={16} />
          {isCashier ? "Reset PIN" : "Reset password"}
        </span>
      </Item>

      <Separator />

      <Item disabled={!permissions.canSetActive} onClick={() => record && onSetActive(record)}>
        <span className={`amgc-row-menu__item ${record?.isActive ? "is-danger" : ""}`}>
          <PowerIcon size={16} />
          {record?.isActive ? "Turn off" : "Turn back on"}
        </span>
      </Item>

      {permissions.reason && (
        <Item disabled>
          <Text className="amgc-row-menu__reason">{permissions.reason}</Text>
        </Item>
      )}
    </Menu>
  );
};

export default StaffMenuList;
