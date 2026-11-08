import { Button, Input, Segmented, Select, Typography } from "antd";
import { AddPersonIcon, StaffIcon } from "../../assets/icons/Icons";
import ListSectionTitle from "../../components/common/ListSectionTitle";
import PageHeader from "../../components/common/PageHeader";
import StaffCredentialForm from "../../components/staff/StaffCredentialForm";
import StaffForm from "../../components/staff/StaffForm";
import StaffTable from "../../components/staff/StaffTable";
import { StaffStatusEnum, staffStatusLabel } from "../../enums/staff.enum";
import { UserRoleEnum } from "../../enums/user-role.enum";
import { useStaffHook } from "../../hooks/staff/staff.hook";
import type { IStaffResponse } from "../../models/staff/staff.response.model";

const { Text } = Typography;

const modalTitle = (title: string) => <Text className="!text-[20px] font-semibold">{title}</Text>;

const Staff = () => {
  const staff = useStaffHook();

  const handleAdd = () => {
    staff.setEditingStaff(null);
    staff.showModal({
      properties: { width: 640, open: true, centered: true, title: modalTitle("Add a person") },
      body: <StaffForm />,
    });
  };

  const handleEdit = (record: IStaffResponse) => {
    staff.setEditingStaff(record);
    staff.showModal({
      properties: { width: 640, open: true, centered: true, title: modalTitle(`Edit ${record.fullName}`) },
      body: <StaffForm />,
    });
  };

  const handleResetCredential = (record: IStaffResponse) => {
    staff.setCredentialStaff(record);
    const label = record.roleCode === UserRoleEnum.cashier ? "PIN" : "password";
    staff.showModal({
      properties: { width: 560, open: true, centered: true, title: modalTitle(`New ${label} for ${record.fullName}`) },
      body: <StaffCredentialForm />,
    });
  };

  return (
    <div>
      <PageHeader
        icon={StaffIcon}
        title="Staff"
        description={
          staff.isOwner
            ? "Everyone who can sign in to the register. You can add managers and cashiers and reset anyone's sign-in."
            : "Everyone who can sign in to the register. Managers add cashiers and reset their PINs; the owner handles manager accounts."
        }
        extra={
          <Button type="primary" size="large" icon={<AddPersonIcon size={18} />} onClick={handleAdd}>
            Add person
          </Button>
        }
      />

      <div className="rounded-2xl bg-[var(--amgc-bg-surface)] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <ListSectionTitle label="People" count={staff.getStaffList.data?.totalCount ?? 0} />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented<StaffStatusEnum>
              value={staff.staffPagination.status}
              onChange={staff.onStatusChange}
              options={[StaffStatusEnum.active, StaffStatusEnum.inactive, StaffStatusEnum.all].map((value) => ({
                value,
                label: staffStatusLabel[value],
              }))}
            />
            <Select
              allowClear
              placeholder="All roles"
              className="min-w-[140px]"
              value={staff.staffPagination.roleCode}
              onChange={staff.onRoleChange}
              options={[
                { value: UserRoleEnum.owner, label: "Owner" },
                { value: UserRoleEnum.manager, label: "Managers" },
                { value: UserRoleEnum.cashier, label: "Cashiers" },
              ]}
            />
            <Input.Search
              allowClear
              placeholder="Search by name"
              className="!w-[220px]"
              onChange={(e) => staff.onSearch(e.currentTarget.value)}
            />
          </div>
        </div>

        <Text className="mb-3 block !text-sm !text-[var(--amgc-text-muted)]">Click a person to see what you can change.</Text>

        <StaffTable
          listLoading={staff.getStaffList.isFetching || staff.isSettingActive}
          staffDataList={!staff.getStaffList.isError ? staff.getStaffList.data : undefined}
          myId={staff.myId}
          menuStaff={staff.menuStaff}
          setMenuStaff={staff.setMenuStaff}
          isTouch={staff.isTouch}
          permissionsFor={staff.permissionsFor}
          onTableChange={staff.onTableChange}
          onEdit={handleEdit}
          onResetCredential={handleResetCredential}
          onSetActive={staff.handleSetActive}
        />
      </div>
    </div>
  );
};

export default Staff;
