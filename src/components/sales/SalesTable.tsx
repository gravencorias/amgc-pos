import { Empty, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd";
import type { ColumnsType, FilterValue, SorterResult } from "antd/es/table/interface";
import { discountKindShort, orderTypeLabel, paymentMethodLabel } from "../../enums/sale.enum";
import type { IPaginatedResult } from "../../models/common/pagination";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { formatTime } from "../../utils/date.util";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

type IProps = {
  listLoading: boolean;
  saleDataList: IPaginatedResult<ISaleResponse> | undefined;
  onTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ISaleResponse> | SorterResult<ISaleResponse>[],
  ) => void;
  onOpen: (record: ISaleResponse) => void;
};

const itemsSummary = (sale: ISaleResponse) =>
  sale.lines.map((l) => (l.qty > 1 ? `${l.qty} × ${l.name}` : l.name)).join(", ");

// One click opens the receipt, so a direct row click (no context menu): there's one action.
const SalesTable = ({ listLoading, saleDataList, onTableChange, onOpen }: IProps) => {
  const columns: ColumnsType<ISaleResponse> = [
    {
      title: "Receipt",
      dataIndex: "receiptNumber",
      width: 130,
      render: (value: string, row) => (
        <div>
          <Text strong className="block tabular-nums">
            {value}
          </Text>
          <Text className="!text-xs !text-[var(--amgc-text-muted)]">Order {row.orderNumber}</Text>
        </div>
      ),
    },
    {
      title: "Time",
      key: "createdAt",
      dataIndex: "createdAt",
      sorter: true,
      defaultSortOrder: "descend",
      width: 110,
      render: (value: string) => <span className="tabular-nums">{formatTime(value)}</span>,
    },
    {
      title: "Items",
      key: "items",
      render: (_, row) => (
        <Text className="block max-w-[320px] truncate" title={itemsSummary(row)}>
          {itemsSummary(row)}
        </Text>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderType",
      width: 150,
      render: (_, row) => (
        <span className="inline-flex items-center gap-2">
          {orderTypeLabel[row.orderType]}
          {row.tableNo ? `, T${row.tableNo}` : ""}
          {row.discount && <Tag className="!m-0">{discountKindShort[row.discount.kind]}</Tag>}
        </span>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      width: 140,
      render: (_, row) => paymentMethodLabel[row.payment.method],
    },
    { title: "Cashier", dataIndex: "cashierName", width: 140 },
    {
      title: "Total",
      key: "total",
      sorter: true,
      width: 120,
      align: "right",
      render: (_, row) => (
        <Text strong className="tabular-nums">
          {peso(row.totals.total)}
        </Text>
      ),
    },
  ];

  return (
    <Table<ISaleResponse>
      rowKey={(record) => record.id}
      loading={listLoading}
      className="w-full"
      scroll={{ x: "max-content" }}
      columns={columns}
      dataSource={saleDataList?.data}
      rowClassName="cursor-pointer"
      onChange={onTableChange}
      locale={{ emptyText: <Empty description="No receipts match. Try another search or payment filter." /> }}
      onRow={(record) => ({ onClick: () => onOpen(record) })}
      pagination={{
        responsive: true,
        current: saleDataList?.currentPage,
        pageSize: saleDataList?.pageSize,
        total: saleDataList?.totalCount,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30, 40, 50],
      }}
    />
  );
};

export default SalesTable;
