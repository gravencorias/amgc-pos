import { create } from "zustand";
import type { ICartLine } from "../../models/register/register.model";
import type { IProductResponse } from "../../models/product/product.response.model";
import type { ISaleDiscountRequest } from "../../models/sale/sale.request.model";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { OrderTypeEnum } from "../../enums/sale.enum";

type States = {
  // The order being rung up.
  lines: ICartLine[];
  orderType: OrderTypeEnum;
  tableNo: string;
  discount: ISaleDiscountRequest | null;
  // The menu side.
  search: string;
  categoryId: number | undefined;
  // Keyboard highlight in the product grid (-1 = none).
  highlight: number;
  // The selected order line (+ / − change its quantity) and the one that just changed.
  selectedKey: string | null;
  flashKey: string | null;
  // The product whose size / add-on picker is open.
  optionProduct: IProductResponse | null;
  lastSale: ISaleResponse | null;
};

type Actions = {
  addLine: (line: ICartLine) => void;
  changeQty: (key: string, delta: number) => void;
  removeLine: (key: string) => void;
  clearOrder: () => void;
  setOrderType: (orderType: OrderTypeEnum) => void;
  toggleOrderType: () => void;
  setTableNo: (tableNo: string) => void;
  setDiscount: (discount: ISaleDiscountRequest | null) => void;
  setSearch: (search: string) => void;
  setCategoryId: (categoryId: number | undefined) => void;
  setHighlight: (highlight: number) => void;
  setSelectedKey: (selectedKey: string | null) => void;
  setOptionProduct: (optionProduct: IProductResponse | null) => void;
  setLastSale: (lastSale: ISaleResponse | null) => void;
};

const emptyOrder = {
  lines: [] as ICartLine[],
  orderType: OrderTypeEnum.dineIn,
  tableNo: "",
  discount: null,
  selectedKey: null,
  flashKey: null,
};

export const useRegisterStore = create<States & Actions>()((set) => ({
  ...emptyOrder,
  search: "",
  categoryId: undefined,
  highlight: -1,
  optionProduct: null,
  lastSale: null,
  addLine: (line) =>
    set((state) => {
      const existing = state.lines.find((l) => l.key === line.key);
      const lines = existing
        ? state.lines.map((l) => (l.key === line.key ? { ...l, qty: Math.min(99, l.qty + line.qty) } : l))
        : [...state.lines, line];
      return { lines, selectedKey: line.key, flashKey: line.key };
    }),
  changeQty: (key, delta) =>
    set((state) => {
      const line = state.lines.find((l) => l.key === key);
      if (!line) return state;
      const qty = line.qty + delta;
      if (qty <= 0) {
        const index = state.lines.indexOf(line);
        const lines = state.lines.filter((l) => l.key !== key);
        return { lines, selectedKey: lines[Math.min(index, lines.length - 1)]?.key ?? null, flashKey: null };
      }
      return {
        lines: state.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)),
        selectedKey: key,
        flashKey: key,
      };
    }),
  removeLine: (key) =>
    set((state) => {
      const index = state.lines.findIndex((l) => l.key === key);
      const lines = state.lines.filter((l) => l.key !== key);
      return { lines, selectedKey: lines[Math.min(index, lines.length - 1)]?.key ?? null, flashKey: null };
    }),
  clearOrder: () => set({ ...emptyOrder }),
  setOrderType: (orderType) => set({ orderType }),
  toggleOrderType: () =>
    set((state) => ({
      orderType: state.orderType === OrderTypeEnum.dineIn ? OrderTypeEnum.takeOut : OrderTypeEnum.dineIn,
    })),
  setTableNo: (tableNo) => set({ tableNo }),
  setDiscount: (discount) => set({ discount }),
  setSearch: (search) => set({ search, highlight: search.trim() ? 0 : -1 }),
  setCategoryId: (categoryId) => set({ categoryId, highlight: -1 }),
  setHighlight: (highlight) => set({ highlight }),
  setSelectedKey: (selectedKey) => set({ selectedKey }),
  setOptionProduct: (optionProduct) => set({ optionProduct }),
  setLastSale: (lastSale) => set({ lastSale }),
}));
