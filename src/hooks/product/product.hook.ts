import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import ProductService from "../../services/product.service";
import type { IProductResponse } from "../../models/product/product.response.model";
import type { IProductTableRequest } from "../../models/product/product.request.model";
import { ProductAvailabilityEnum } from "../../enums/product.enum";
import { useDrawerStore } from "../../stores/common/drawer.store";
import { useModalStore } from "../../stores/common/modal.store";
import { useProductStore } from "../../stores/data/product.store";
import { debounce } from "../../utils/debouncer";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { ADD_ONS_KEY, CATEGORIES_KEY, PRODUCT_ALL_KEY, PRODUCT_LIST_KEY } from "../../constants/constantQueryKeys";
import { useAddOnsQuery } from "../add-on/add-on.hook";
import { useCategoriesQuery } from "../category/category.hook";

export const useProductHook = () => {
  const queryClient = useQueryClient();
  const { showModal } = useModalStore();
  const { showDrawer } = useDrawerStore();
  const {
    productPagination,
    setProductPagination,
    setEditingProduct,
    menuProduct,
    setMenuProduct,
    setPendingPhoto,
    setRemovePhoto,
  } = useProductStore();

  const getProductList = useQuery({
    queryKey: [...PRODUCT_LIST_KEY, productPagination],
    queryFn: () => ProductService.getPageList({ ...productPagination }),
  });
  // For the category chips and the add-on names shown under each product.
  const categoriesQuery = useCategoriesQuery();
  const addOnsQuery = useAddOnsQuery();
  const categories = categoriesQuery.data ?? [];
  const addOnNames: Record<number, string> = Object.fromEntries((addOnsQuery.data ?? []).map((a) => [a.id, a.name]));

  // Category and add-on product counts change whenever products do.
  const invalidateMenu = () => {
    queryClient.invalidateQueries(PRODUCT_LIST_KEY);
    queryClient.invalidateQueries(PRODUCT_ALL_KEY);
    queryClient.invalidateQueries(CATEGORIES_KEY);
    queryClient.invalidateQueries(ADD_ONS_KEY);
  };

  const availableMutation = useMutation({
    mutationFn: ProductService.setAvailable,
    onSuccess: (response: IProductResponse) => {
      Toast.fire({
        icon: "success",
        title: response.isAvailable ? `${response.name} is back on the menu` : `${response.name} marked sold out`,
      });
      queryClient.invalidateQueries(PRODUCT_LIST_KEY);
      queryClient.invalidateQueries(PRODUCT_ALL_KEY);
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "That change couldn't be saved.") }),
  });

  const deleteMutation = useMutation({
    mutationFn: ProductService.deleteProduct,
    onSuccess: (response: IProductResponse) => {
      Toast.fire({ icon: "success", title: `${response.name} deleted` });
      invalidateMenu();
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The product couldn't be deleted.") }),
  });

  const handleDelete = (record: IProductResponse) => {
    showPopConfirmation({
      title: `Delete ${record.name}?`,
      text: "It's removed from the register. Past sales keep its name and price. To hide it for now, mark it sold out instead.",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(record.id);
    });
  };

  // Opening the form always starts with no photo change pending.
  const prepareForm = (record: IProductResponse | null) => {
    setPendingPhoto(null);
    setRemovePhoto(false);
    setEditingProduct(record);
  };

  const updatePagination = (changes: Partial<IProductTableRequest>) =>
    setProductPagination({ ...productPagination, ...changes, pageNumber: 1 });

  const onTableChange = (
    tableConfig: TablePaginationConfig,
    _: Record<string, FilterValue | null>,
    sorter: SorterResult<IProductResponse> | SorterResult<IProductResponse>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    setProductPagination({
      ...productPagination,
      pageNumber: tableConfig.current ?? 1,
      pageSize: tableConfig.pageSize ?? 10,
      sort: single?.columnKey && single.order ? `${single.columnKey}_${single.order}` : undefined,
    });
  };

  return {
    getProductList,
    categories,
    totalInMenu: categories.reduce((sum, c) => sum + c.productCount, 0),
    addOnNames,
    productPagination,
    showModal,
    showDrawer,
    menuProduct,
    setMenuProduct,
    prepareForm,
    handleDelete,
    toggleAvailable: (record: IProductResponse) =>
      availableMutation.mutate({ id: record.id, isAvailable: !record.isAvailable }),
    isBusy: availableMutation.isLoading || deleteMutation.isLoading,
    onSearch: (value: string) => debounce({ debouncer: () => updatePagination({ search: value }), debounceTimeout: 600 }),
    onCategoryChange: (categoryId: number | undefined) => updatePagination({ categoryId }),
    onAvailabilityChange: (availability: ProductAvailabilityEnum) => updatePagination({ availability }),
    onTableChange,
  };
};
