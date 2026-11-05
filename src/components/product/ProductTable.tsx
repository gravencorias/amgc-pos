import { Empty, Switch, Table, Tag, Typography } from "antd";
import type { TablePaginationConfig } from "antd";
import type { ColumnsType, FilterValue, SorterResult } from "antd/es/table/interface";
import { useContextMenu } from "react-contexify";
import type { IPaginatedResult } from "../../models/common/pagination";
import type { IProductResponse } from "../../models/product/product.response.model";
import { pesoAmount } from "../../utils/helpers";
import CategoryIcon from "../common/CategoryIcon";
import ProductArt from "./ProductArt";
import ProductMenuList from "./ProductMenuList";

const { Text } = Typography;

type IProps = {
  listLoading: boolean;
  productDataList: IPaginatedResult<IProductResponse> | undefined;
  addOnNames: Record<number, string>;
  menuProduct: IProductResponse | null;
  setMenuProduct: (record: IProductResponse) => void;
  onTableChange: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<IProductResponse> | SorterResult<IProductResponse>[],
  ) => void;
  onEdit: (record: IProductResponse) => void;
  onToggleAvailable: (record: IProductResponse) => void;
  onDelete: (record: IProductResponse) => void;
};

const sizesSummary = (row: IProductResponse) =>
  row.sizes.length ? row.sizes.map((s) => `${s.name} ${pesoAmount(s.price)}`).join(", ") : "One size";

const ProductTable = ({
  listLoading,
  productDataList,
  addOnNames,
  menuProduct,
  setMenuProduct,
  onTableChange,
  onEdit,
  onToggleAvailable,
  onDelete,
}: IProps) => {
  const menuId = "product-list-id";
  const { show } = useContextMenu({ id: menuId });

  const columns: ColumnsType<IProductResponse> = [
    {
      title: "Product",
      key: "name",
      dataIndex: "name",
      sorter: true,
      render: (_, row) => (
        <div className={`flex items-center gap-3 ${row.isAvailable ? "" : "opacity-60"}`}>
          <ProductArt photoUrl={row.photoUrl} icon={row.categoryIcon} name={row.name} />
          <div className="min-w-0">
            <Text strong className="block">
              {row.name}
            </Text>
            <Text className="block max-w-[340px] truncate !text-xs !text-[var(--amgc-text-muted)]">
              {sizesSummary(row)}
              {row.addOnIds.length > 0 &&
                `. Add-ons: ${row.addOnIds
                  .map((id) => addOnNames[id])
                  .filter(Boolean)
                  .join(", ")}`}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      width: 200,
      render: (value: string, row) => (
        <span className="inline-flex items-center gap-2">
          <CategoryIcon icon={row.categoryIcon} size={15} aria-hidden />
          {value}
        </span>
      ),
    },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      sorter: true,
      width: 130,
      align: "right",
      render: (value: number, row) => (
        <Text strong className="tabular-nums">
          {row.sizes.length > 1 && <span className="mr-1 font-normal text-[var(--amgc-text-muted)]">from</span>}
          {pesoAmount(value)}
        </Text>
      ),
    },
    {
      title: "On the menu",
      dataIndex: "isAvailable",
      width: 150,
      render: (isAvailable: boolean, row) => (
        // Its own click: toggling must not also open the row menu.
        <span className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            size="small"
            checked={isAvailable}
            aria-label={`${row.name} available`}
            onChange={() => onToggleAvailable(row)}
          />
          {isAvailable ? "Available" : <Tag className="!m-0">Sold out</Tag>}
        </span>
      ),
    },
  ];

  return (
    <>
      <Table<IProductResponse>
        rowKey={(record) => record.id}
        loading={listLoading}
        className="w-full"
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={productDataList?.data}
        rowClassName="cursor-pointer"
        onChange={onTableChange}
        locale={{ emptyText: <Empty description="No products match. Try another name or category." /> }}
        onRow={(record) => ({
          onClick: (e) => {
            setMenuProduct(record);
            show({ event: e, props: { record } });
          },
        })}
        pagination={{
          responsive: true,
          current: productDataList?.currentPage,
          pageSize: productDataList?.pageSize,
          total: productDataList?.totalCount,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 30, 40, 50],
        }}
      />

      <ProductMenuList
        id={menuId}
        record={menuProduct}
        onEdit={onEdit}
        onToggleAvailable={onToggleAvailable}
        onDelete={onDelete}
      />
    </>
  );
};

export default ProductTable;
