import { Empty, Table, Tag, Typography, type TablePaginationConfig } from "antd";
import { DayCloseStatusEnum } from "../../enums/day-close.enum";
import type { ColumnsType } from "antd/es/table/interface";
import type { IPaginatedResult } from "../../models/common/pagination";
import type { IDayCloseResponse } from "../../models/day-close/day-close.response.model";
import { formatLongDate } from "../../utils/date.util";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

interface IProps {
  listLoading: boolean;
  closeDataList: IPaginatedResult<IDayCloseResponse> | undefined;
  onTableChange: (pagination: TablePaginationConfig) => void;
  onOpen: (record: IDayCloseResponse) => void;
}

// Over is green, short is red, balanced is plain.
const OverShort = ({ value }: { value: number }) =>
  value === 0 ? (
    <Text className="!text-[var(--amgc-text-muted)]">Balanced</Text>
  ) : (
    <Text strong type={value > 0 ? "success" : "danger"} className="tabular-nums">
      {value > 0 ? "Over " : "Short "}
      {peso(Math.abs(value))}
    </Text>
  );

// Past closings, newest first, reopened ones muted. A row opens its Z reading, which is
// where reprint and reopen live, so it's a row click rather than a row menu.
const DayCloseTable = ({ listLoading, closeDataList, onTableChange, onOpen }: IProps) => {
  const columns: ColumnsType<IDayCloseResponse> = [
    {
      title: "Z no.",
      dataIndex: "zNumber",
      width: 90,
      render: (value: string) => (
        <Text strong className="tabular-nums">
          {value}
        </Text>
      ),
    },
    {
      title: "Day",
      dataIndex: "date",
      render: (value: string, row) => (
        <span className="inline-flex items-center gap-2">
          {formatLongDate(value)}
          {row.status === DayCloseStatusEnum.reopened && (
            <Tag color="warning" className="!m-0" title={row.reopenInfo?.reason}>
              Reopened
            </Tag>
          )}
        </span>
      ),
    },
    { title: "Sales", key: "saleCount", width: 90, align: "right", render: (_, row) => row.figures.saleCount },
    {
      title: "Net sales",
      key: "netSales",
      width: 140,
      align: "right",
      render: (_, row) => <span className="tabular-nums">{peso(row.figures.netSales)}</span>,
    },
    { title: "Cash", key: "overShort", width: 150, render: (_, row) => <OverShort value={row.overShort} /> },
    { title: "Closed by", dataIndex: "closedByName", width: 160 },
  ];

  return (
    <Table<IDayCloseResponse>
      rowKey={(record) => record.id}
      loading={listLoading}
      scroll={{ x: "max-content" }}
      columns={columns}
      dataSource={closeDataList?.data}
      rowClassName={(row) => `cursor-pointer${row.status === DayCloseStatusEnum.reopened ? " amgc-row-void" : ""}`}
      onChange={onTableChange}
      onRow={(record) => ({ onClick: () => onOpen(record) })}
      locale={{ emptyText: <Empty description="No day has been closed yet." /> }}
      pagination={{
        responsive: true,
        current: closeDataList?.currentPage,
        pageSize: closeDataList?.pageSize,
        total: closeDataList?.totalCount,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30],
      }}
    />
  );
};

export default DayCloseTable;
