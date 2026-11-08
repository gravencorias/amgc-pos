import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography, type InputRef } from "antd";
import ProductService from "../../services/product.service";
import type { IProductResponse } from "../../models/product/product.response.model";
import DayCloseService from "../../services/day-close.service";
import { DAY_CLOSE_TODAY_KEY, PRODUCT_ALL_KEY } from "../../constants/constantQueryKeys";
import { formatTime } from "../../utils/date.util";
import { useDrawerStore } from "../../stores/common/drawer.store";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { isTouchMode } from "../../utils/touch.util";
import { cartGross, cartLineKey, computeSaleTotals, normalizeSearch } from "../../utils/sale.util";
import { useCategoriesQuery } from "../category/category.hook";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import RegisterOptionsForm from "../../components/register/RegisterOptionsForm";
import RegisterDiscountForm from "../../components/register/RegisterDiscountForm";
import RegisterPaymentForm from "../../components/register/RegisterPaymentForm";

const { Text } = Typography;

const modalTitle = (title: string) => <Text className="!text-[20px] font-semibold">{title}</Text>;

// .tsx: it opens the register's modals itself, because the keyboard shortcuts do too.
export const useRegisterHook = () => {
  const searchRef = useRef<InputRef>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { showModal } = useModalStore();
  const register = useRegisterStore();
  const productsQuery = useQuery({ queryKey: PRODUCT_ALL_KEY, queryFn: ProductService.getAll });
  const categoriesQuery = useCategoriesQuery();
  const { data: settings } = useStoreSettingsQuery();
  // Once the day's Z reading is done, no more sales today. Checked every minute, because
  // the day is often closed from another computer.
  const todayQuery = useQuery({
    queryKey: DAY_CLOSE_TODAY_KEY,
    queryFn: DayCloseService.getToday,
    refetchInterval: 60_000,
  });
  const today = todayQuery.data;
  const dayClosedNote =
    today?.isClosed && today.closedAt
      ? `Z reading ${today.zNumber}, ${formatTime(today.closedAt)}, by ${today.closedByName}. Sales start again tomorrow.`
      : null;

  const products = productsQuery.data ?? [];
  const query = normalizeSearch(register.search);
  const visibleProducts = products.filter(
    (p) => (!register.categoryId || p.categoryId === register.categoryId) && (!query || normalizeSearch(p.name).includes(query)),
  );
  const qtyByProduct = register.lines.reduce<Record<number, number>>((acc, l) => {
    acc[l.productId] = (acc[l.productId] ?? 0) + l.qty;
    return acc;
  }, {});
  const totals = computeSaleTotals(cartGross(register.lines), !!register.discount, settings?.vatRegistered ?? true);
  const itemCount = register.lines.reduce((sum, l) => sum + l.qty, 0);

  // Not in touch mode: focusing the box would pop up the on-screen keyboard after every sale.
  // Tapping tiles and chips is how items are added there.
  const focusSearch = () => {
    if (!isTouchMode()) searchRef.current?.focus({ preventScroll: true });
  };
  // Opening a dialog moves focus off the search box, so number keys and Enter reach the
  // dialog instead of being typed into the search behind it.
  const blurSearch = () => searchRef.current?.blur();

  const openOptions = (product: IProductResponse) => {
    blurSearch();
    register.setOptionProduct(product);
    showModal({
      properties: { open: true, centered: true, width: 560, title: modalTitle(product.name) },
      // A new key each time remounts the form, so it starts from this product's defaults.
      body: <RegisterOptionsForm key={`${product.id}-${Date.now()}`} />,
    });
  };

  const addProduct = (product: IProductResponse) => {
    if (!product.isAvailable) {
      Toast.fire({ icon: "warning", title: `${product.name} is sold out.` });
      return;
    }
    if (product.sizes.length || product.addOnIds.length) {
      openOptions(product);
      return;
    }
    register.addLine({
      key: cartLineKey(product.id, null, [], null),
      productId: product.id,
      name: product.name,
      categoryIcon: product.categoryIcon,
      photoUrl: product.photoUrl,
      sizeName: null,
      addOns: [],
      note: null,
      unitPrice: product.price,
      qty: 1,
    });
  };

  const openDiscount = () => {
    blurSearch();
    showModal({
      properties: { open: true, centered: true, width: 520, title: modalTitle("Senior citizen or PWD discount") },
      body: <RegisterDiscountForm key={Date.now()} />,
    });
  };

  const openPayment = () => {
    if (dayClosedNote) {
      Toast.fire({ icon: "warning", title: "Today is closed. Sales start again tomorrow." });
      return;
    }
    if (!useRegisterStore.getState().lines.length) {
      Toast.fire({ icon: "info", title: "Add at least one item before charging." });
      return;
    }
    blurSearch();
    showModal({
      // Wider in touch mode, where the number pad sits beside the cash fields so Complete sale
      // stays on screen under a tablet browser's address bar.
      properties: { open: true, centered: true, width: isTouchMode() ? 720 : 560, title: modalTitle("Charge") },
      body: <RegisterPaymentForm key={Date.now()} />,
    });
  };

  const askClearOrder = () => {
    const count = useRegisterStore.getState().lines.reduce((sum, l) => sum + l.qty, 0);
    if (!count) return;
    showPopConfirmation({
      title: "Clear this order?",
      text: `${count} item${count === 1 ? "" : "s"} will be removed.`,
      confirmButtonText: "Clear order",
    }).then((result) => {
      if (result.isConfirmed) register.clearOrder();
      focusSearch();
    });
  };

  // The keyboard handler is registered once; it reads the newest values from here.
  const latest = useRef({ visibleProducts, addProduct, openDiscount, openPayment, askClearOrder });
  useEffect(() => {
    latest.current = { visibleProducts, addProduct, openDiscount, openPayment, askClearOrder };
  });

  useEffect(() => {
    focusSearch();

    const moveHighlight = (key: string, count: number) => {
      if (!count) return;
      const grid = gridRef.current;
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 1;
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[key] ?? 0;
      const { highlight, setHighlight } = useRegisterStore.getState();
      setHighlight(highlight < 0 ? 0 : Math.max(0, Math.min(count - 1, highlight + step)));
    };

    const moveSelection = (step: number) => {
      const { lines, selectedKey, setSelectedKey } = useRegisterStore.getState();
      if (!lines.length) return;
      const index = lines.findIndex((l) => l.key === selectedKey);
      const next = index < 0 ? (step > 0 ? 0 : lines.length - 1) : Math.max(0, Math.min(lines.length - 1, index + step));
      setSelectedKey(lines[next].key);
    };

    const bumpSelected = (delta: number) => {
      const { lines, selectedKey, changeQty } = useRegisterStore.getState();
      const key = selectedKey ?? lines[lines.length - 1]?.key;
      if (key) changeQty(key, delta);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Modals, panels and confirmations handle their own keys.
      if (useModalStore.getState().modal.properties?.open) return;
      if (useDrawerStore.getState().drawer.properties?.open) return;
      if (document.querySelector(".swal2-container")) return;

      const target = e.target as HTMLElement | null;
      const inSearch = !!target && target === searchRef.current?.input;
      const inField = !inSearch && !!target?.closest("input, textarea, select, [contenteditable='true']");
      const { visibleProducts: list, addProduct: add, openDiscount: discount, openPayment: pay, askClearOrder: clear } =
        latest.current;

      switch (e.key) {
        case "F2":
          e.preventDefault();
          searchRef.current?.focus({ cursor: "all" });
          return;
        case "F4":
          e.preventDefault();
          discount();
          return;
        case "F8":
          e.preventDefault();
          useRegisterStore.getState().toggleOrderType();
          return;
        case "F9":
          e.preventDefault();
          pay();
          return;
      }

      if (inSearch) {
        if (e.key.startsWith("Arrow")) {
          e.preventDefault();
          moveHighlight(e.key, list.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const { highlight, setSearch } = useRegisterStore.getState();
          const product = list[highlight < 0 ? 0 : highlight];
          if (!product) return;
          setSearch("");
          add(product);
        } else if (e.key === "Escape") {
          const { search, setSearch } = useRegisterStore.getState();
          if (search) setSearch("");
          else searchRef.current?.blur();
        }
        return;
      }

      if (inField || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Delete") {
        e.preventDefault();
        clear();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        bumpSelected(1);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        bumpSelected(-1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(e.key === "ArrowUp" ? -1 : 1);
      } else if (e.key.length === 1 && e.key !== " ") {
        // Typing anywhere starts a search; the key lands in the box.
        focusSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Keep the highlighted product in view while arrowing through the grid.
  useEffect(() => {
    gridRef.current?.querySelector(".is-highlighted")?.scrollIntoView({ block: "nearest" });
  }, [register.highlight, register.search]);

  // A changed line flashes once.
  useEffect(() => {
    if (!register.flashKey) return;
    const id = window.setTimeout(() => useRegisterStore.setState({ flashKey: null }), 700);
    return () => window.clearTimeout(id);
  }, [register.flashKey, register.lines]);

  return {
    searchRef,
    gridRef,
    register,
    categories: categoriesQuery.data ?? [],
    products,
    visibleProducts,
    isLoadingMenu: productsQuery.isLoading,
    qtyByProduct,
    totals,
    itemCount,
    vatRegistered: settings?.vatRegistered ?? true,
    dayClosedNote,
    addProduct,
    openDiscount,
    openPayment,
    askClearOrder,
    focusSearch,
  };
};
