import { Avatar, Badge, Button, Empty, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd";
import type { ColumnsType, FilterValue, SorterResult } from "antd/es/table/interface";
import { useContextMenu } from "react-contexify";
import { MoreIcon } from "../../assets/icons/Icons";
import type { IPaginatedResult } from "../../models/common/pagination";
import type { IStaffResponse } from "../../models/staff/staff.response.model";
import { UserRoleEnum } from "../../enums/user-role.enum";
import type { IStaffPermissions } from "../../hooks/staff/staff.hook";
import { formatDateTime, getInitials } from "../../utils/helpers";
import StaffMenuList from "./StaffMenuList";

const { Text } = Typography;

type IProps = {
  listLoading: boolean;
  staffDataList: IPaginatedResult<IStaffResponse> | undefined;
  myId: number;
  menuStaff: IStaffResponse | null;
  setMenuStaff: (record: IStaffResponse) => void;
  // Touch mode adds a visible ⋯ button that opens the row menu.
  isTouch: boolean;
  permissionsFor: (record: IStaffResponse | null) => IStaffPermissions;
  onTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<IStaffResponse> | SorterResult<IStaffResponse>[],
  ) => void;
  onEdit: (record: IStaffResponse) => void;
  onResetCredential: (record: IStaffResponse) => void;
  onSetActive: (record: IStaffResponse) => void;
};

const roleColor: Record<string, string | undefined> = {
  [UserRoleEnum.owner]: "gold",
  [UserRoleEnum.manager]: "blue",
};

const StaffTable = ({
  listLoading,
  staffDataList,
  myId,
  menuStaff,
  setMenuStaff,
  isTouch,
  permissionsFor,
  onTableChange,
  onEdit,
  onResetCredential,
  onSetActive,
}: IProps) => {
  const menuId = "staff-list-id";
  const { show } = useContextMenu({ id: menuId });

  const columns: ColumnsType<IStaffResponse> = [
    {
      title: "Name",
      key: "fullName",
      dataIndex: "fullName",
      sorter: true,
      render: (_, row) => (
        <div className={`flex items-center gap-3 ${row.isActive ? "" : "opacity-60"}`}>
          <Avatar className="shrink-0 !bg-[var(--amgc-bg-subtle)] !text-[var(--amgc-text-strong)] font-semibold">
            {getInitials(row.fullName)}
          </Avatar>
          <div className="min-w-0">
            <Text strong className="block">
              {row.fullName}
              {row.id === myId && <Tag className="!ml-2">You</Tag>}
            </Text>
            <Text className="block !text-xs !text-[var(--amgc-text-muted)]">
              {row.username ? `@${row.username}` : "Signs in with a PIN"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "roleName",
      width: 120,
      render: (value: string, row) => <Tag color={roleColor[row.roleCode]}>{value}</Tag>,
    },
    {
      title: "Sign-in",
      key: "signIn",
      width: 190,
      render: (_, row) =>
        row.roleCode === UserRoleEnum.cashier ? (
          row.hasPin ? (
            "PIN"
          ) : (
            <Text type="warning">No PIN yet</Text>
          )
        ) : (
          "Username and password"
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 130,
      render: (isActive: boolean) => (
        <Badge status={isActive ? "success" : "default"} text={isActive ? "Active" : "Turned off"} />
      ),
    },
    {
      title: "Last sign-in",
      key: "lastSignInAt",
      dataIndex: "lastSignInAt",
      sorter: true,
      width: 170,
      render: (value: string | null) => formatDateTime(value) ?? <Text type="secondary">Never</Text>,
    },
  ];

  // Touch mode: the same row menu from a visible ⋯, so it's clear the rows have one.
  const actionsColumn: ColumnsType<IStaffResponse>[number] = {
    key: "actions",
    width: 64,
    // Pinned, so a table that scrolls sideways on a tablet keeps the button in view.
    fixed: "right",
    align: "right",
    render: (_, row) => (
      <Button
        type="text"
        aria-label={`Options for ${row.fullName}`}
        icon={<MoreIcon size={20} />}
        onClick={(e) => {
          e.stopPropagation();
          setMenuStaff(row);
          show({ event: e, props: { record: row } });
        }}
      />
    ),
  };

  return (
    <>
      <Table<IStaffResponse>
        rowKey={(record) => record.id}
        loading={listLoading}
        className="w-full"
        scroll={{ x: "max-content" }}
        columns={[...columns, ...(isTouch ? [actionsColumn] : [])]}
        dataSource={staffDataList?.data}
        rowClassName="cursor-pointer"
        onChange={onTableChange}
        locale={{ emptyText: <Empty description="No one matches. Try another name or filter." /> }}
        onRow={(record) => ({
          onClick: (e) => {
            setMenuStaff(record);
            show({ event: e, props: { record } });
          },
        })}
        pagination={{
          responsive: true,
          current: staffDataList?.currentPage,
          pageSize: staffDataList?.pageSize,
          total: staffDataList?.totalCount,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 30, 40, 50],
        }}
      />

      <StaffMenuList
        id={menuId}
        record={menuStaff}
        permissions={permissionsFor(menuStaff)}
        onEdit={onEdit}
        onResetCredential={onResetCredential}
        onSetActive={onSetActive}
      />
    </>
  );
};

export default StaffTable;
