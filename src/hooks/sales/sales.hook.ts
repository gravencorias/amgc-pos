import { useQuery } from "@tanstack/react-query";
import type { TablePaginationConfig } from "antd";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { Dayjs } from "dayjs";
import SaleService from "../../services/sale.service";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import type { PaymentMethodEnum } from "../../enums/sale.enum";
import { SALE_LIST_KEY, SALE_SUMMARY_KEY } from "../../constants/constantQueryKeys";
import { useModalStore } from "../../stores/common/modal.store";
import { useSalesStore } from "../../stores/data/sales.store";
import { debounce } from "../../utils/debouncer";
import { phToday, shiftDate } from "../../utils/date.util";
import useClock from "../clock/clock.hook";

export const useSalesHook = () => {
  const { showModal } = useModalStore();
  const { salesDate, setSalesDate, salesPagination, setSalesPagination, setViewingSale } = useSalesStore();
  const today = phToday();
  const currentTime = useClock();

  const summaryQuery = useQuery({
    queryKey: [...SALE_SUMMARY_KEY, salesDate],
    queryFn: () => SaleService.getSummary(salesDate),
  });

  const saleListQuery = useQuery({
    queryKey: [...SALE_LIST_KEY, salesDate, salesPagination],
    queryFn: () => SaleService.getPageList({ ...salesPagination, date: salesDate }),
  });

  const updatePagination = (changes: Partial<typeof salesPagination>) =>
    setSalesPagination({ ...salesPagination, ...changes, pageNumber: 1 });

  const onTableChange = (
    tableConfig: TablePaginationConfig,
    _: Record<string, FilterValue | null>,
    sorter: SorterResult<ISaleResponse> | SorterResult<ISaleResponse>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    setSalesPagination({
      ...salesPagination,
      pageNumber: tableConfig.current ?? 1,
      pageSize: tableConfig.pageSize ?? 10,
      sort: single?.columnKey && single.order ? `${single.columnKey}_${single.order}` : undefined,
    });
  };

  return {
    salesDate,
    isToday: salesDate === today,
    currentTime,
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    saleListQuery,
    salesPagination,
    showModal,
    setViewingSale,
    onDateChange: (value: Dayjs | null) => value && setSalesDate(value.format("YYYY-MM-DD")),
    onPreviousDay: () => setSalesDate(shiftDate(salesDate, -1)),
    onNextDay: () => salesDate < today && setSalesDate(shiftDate(salesDate, 1)),
    onToday: () => setSalesDate(today),
    // The future has no sales.
    isFutureDate: (value: Dayjs) => value.format("YYYY-MM-DD") > today,
    onSearch: (value: string) => debounce({ debouncer: () => updatePagination({ search: value }), debounceTimeout: 600 }),
    onPaymentChange: (paymentMethod: PaymentMethodEnum | undefined) => updatePagination({ paymentMethod }),
    onTableChange,
  };
};
