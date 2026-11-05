import { Button, Input, Segmented, Typography } from "antd";
import { AddOnsIcon, CategoriesIcon, PlusIcon, ProductsIcon } from "../../assets/icons/Icons";
import AddOnManager from "../../components/add-on/AddOnManager";
import CategoryManager from "../../components/category/CategoryManager";
import CategoryChip from "../../components/common/CategoryChip";
import ListSectionTitle from "../../components/common/ListSectionTitle";
import PageHeader from "../../components/common/PageHeader";
import ProductForm from "../../components/product/ProductForm";
import ProductTable from "../../components/product/ProductTable";
import type { ReactNode } from "react";
import { ProductAvailabilityEnum, productAvailabilityLabel } from "../../enums/product.enum";
import { useProductHook } from "../../hooks/product/product.hook";
import type { IProductResponse } from "../../models/product/product.response.model";

const { Text } = Typography;

const Products = () => {
  const products = useProductHook();

  const openForm = (record: IProductResponse | null) => {
    products.prepareForm(record);
    products.showModal({
      properties: {
        width: 820,
        open: true,
        centered: true,
        title: <Text className="!text-[20px] font-semibold">{record ? `Edit ${record.name}` : "Add a product"}</Text>,
      },
      body: <ProductForm />,
    });
  };

  const openPanel = (title: string, body: ReactNode) =>
    products.showDrawer({ properties: { open: true, placement: "right", size: 440, title }, body });

  return (
    <div>
      <PageHeader
        icon={ProductsIcon}
        title="Products"
        description="The menu the register sells from. Mark items sold out when they run out; changes show on every register."
        extra={
          <div className="flex flex-wrap gap-2">
            <Button size="large" icon={<CategoriesIcon size={18} />} onClick={() => openPanel("Categories", <CategoryManager />)}>
              Categories
            </Button>
            <Button size="large" icon={<AddOnsIcon size={18} />} onClick={() => openPanel("Add-ons", <AddOnManager />)}>
              Add-ons
            </Button>
            <Button type="primary" size="large" icon={<PlusIcon size={18} />} onClick={() => openForm(null)}>
              Add product
            </Button>
          </div>
        }
      />

      <div className="rounded-2xl bg-[var(--amgc-bg-surface)] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <ListSectionTitle label="Products" count={products.getProductList.data?.totalCount ?? 0} />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented<ProductAvailabilityEnum>
              value={products.productPagination.availability}
              onChange={products.onAvailabilityChange}
              options={Object.values(ProductAvailabilityEnum).map((value) => ({
                value,
                label: productAvailabilityLabel[value],
              }))}
            />
            <Input.Search
              allowClear
              placeholder="Search products"
              className="!w-[220px]"
              onChange={(e) => products.onSearch(e.currentTarget.value)}
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <CategoryChip
            label="All"
            count={products.totalInMenu}
            checked={!products.productPagination.categoryId}
            onChange={() => products.onCategoryChange(undefined)}
          />
          {products.categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              count={c.productCount}
              icon={c.icon}
              checked={products.productPagination.categoryId === c.id}
              onChange={() => products.onCategoryChange(c.id)}
            />
          ))}
        </div>

        <ProductTable
          listLoading={products.getProductList.isFetching || products.isBusy}
          productDataList={!products.getProductList.isError ? products.getProductList.data : undefined}
          addOnNames={products.addOnNames}
          menuProduct={products.menuProduct}
          setMenuProduct={products.setMenuProduct}
          onTableChange={products.onTableChange}
          onEdit={openForm}
          onToggleAvailable={products.toggleAvailable}
          onDelete={products.handleDelete}
        />
      </div>
    </div>
  );
};

export default Products;
