import type { RefObject } from "react";
import { Empty, Input, Skeleton, type InputRef } from "antd";
import { SearchIcon } from "../../assets/icons/Icons";
import type { ICategoryResponse } from "../../models/category/category.response.model";
import type { IProductResponse } from "../../models/product/product.response.model";
import { pesoAmount } from "../../utils/helpers";
import CategoryChip from "../common/CategoryChip";
import ProductArt from "../product/ProductArt";

interface IProps {
  searchRef: RefObject<InputRef | null>;
  gridRef: RefObject<HTMLDivElement | null>;
  search: string;
  onSearchChange: (value: string) => void;
  categories: ICategoryResponse[];
  categoryId: number | undefined;
  onCategoryChange: (categoryId: number | undefined) => void;
  products: IProductResponse[];
  totalProducts: number;
  isLoading: boolean;
  highlight: number;
  qtyByProduct: Record<number, number>;
  onAdd: (product: IProductResponse) => void;
}

const priceLabel = (p: IProductResponse) => (p.sizes.length > 1 ? `from ${pesoAmount(p.price)}` : pesoAmount(p.price));

const RegisterMenu = ({
  searchRef,
  gridRef,
  search,
  onSearchChange,
  categories,
  categoryId,
  onCategoryChange,
  products,
  totalProducts,
  isLoading,
  highlight,
  qtyByProduct,
  onAdd,
}: IProps) => (
  <section className="amgc-register__menu" aria-label="Menu">
    <Input
      id="register-search"
      ref={searchRef}
      size="large"
      allowClear
      autoComplete="off"
      placeholder="Search products"
      aria-label="Search products"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      prefix={<SearchIcon size={18} className="text-[var(--amgc-text-muted)]" />}
      suffix={<kbd className="amgc-kbd">F2</kbd>}
      className="!rounded-full"
    />

    {/* One scrolling row. A mouse wheel scrolls it sideways, since most mice have no horizontal wheel. */}
    <div
      className="amgc-register__chips"
      role="group"
      aria-label="Categories"
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
      }}
    >
      <CategoryChip label="All" count={totalProducts} checked={!categoryId} onChange={() => onCategoryChange(undefined)} />
      {categories.map((c) => (
        <CategoryChip
          key={c.id}
          label={c.name}
          count={c.productCount}
          icon={c.icon}
          checked={categoryId === c.id}
          onChange={() => onCategoryChange(c.id)}
        />
      ))}
    </div>

    <div className="amgc-register__grid-wrap">
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : products.length ? (
        <div className="amgc-register__grid" ref={gridRef}>
          {products.map((p, index) => (
            <button
              key={p.id}
              type="button"
              className={`amgc-tile ${index === highlight ? "is-highlighted" : ""} ${p.isAvailable ? "" : "is-sold-out"}`}
              aria-disabled={!p.isAvailable}
              aria-label={`${p.name}, ${priceLabel(p)}${p.isAvailable ? "" : ", sold out"}`}
              onClick={() => onAdd(p)}
            >
              <span className="amgc-tile__art">
                <ProductArt photoUrl={p.photoUrl} icon={p.categoryIcon} name={p.name} size={120} />
                {!p.isAvailable && <span className="amgc-tile__flag">Sold out</span>}
                {qtyByProduct[p.id] > 0 && <span className="amgc-tile__badge">{qtyByProduct[p.id]}</span>}
              </span>
              <span className="amgc-tile__name">{p.name}</span>
              <span className="amgc-tile__price">{priceLabel(p)}</span>
            </button>
          ))}
        </div>
      ) : (
        <Empty
          className="!mt-12"
          description={
            search ? `No products match "${search}". Check the spelling, or choose All.` : "No products in this category yet."
          }
        />
      )}
    </div>
  </section>
);

export default RegisterMenu;
