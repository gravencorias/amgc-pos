import { useEffect } from "react";
import { Form, Typography, type TablePaginationConfig } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import DayCloseService from "../../services/day-close.service";
import type { IDayCloseFormValues } from "../../models/day-close/day-close.request.model";
import type { IDayCloseResponse } from "../../models/day-close/day-close.response.model";
import { CASH_DENOMINATIONS } from "../../constants/constantCash";
import { DAY_CLOSE_CURRENT_KEY, DAY_CLOSE_LIST_KEY, DAY_CLOSE_TODAY_KEY } from "../../constants/constantQueryKeys";
import { useModalStore } from "../../stores/common/modal.store";
import { useCloseDayStore } from "../../stores/data/close-day.store";
import { showPopConfirmation, Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { formatLongDate } from "../../utils/date.util";
import ZReadingView from "../../components/close-day/ZReadingView";
import DayReopenForm from "../../components/close-day/DayReopenForm";
import { DayCloseStatusEnum } from "../../enums/day-close.enum";
import { useAuthStore } from "../../stores/common/auth.store";
import { checkIfOwner } from "../../utils/roleChecker";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";

const { Text } = Typography;

const round2 = (n: number) => Math.round(n * 100) / 100;

// The drawer's total from the count: each denomination times how many there are.
const cashTotal = (counts: IDayCloseFormValues["counts"] | undefined) =>
  round2(CASH_DENOMINATIONS.reduce((sum, d) => sum + d.value * (counts?.[String(d.value)] ?? 0), 0));

// .tsx: it opens the Z reading in the modal, after closing and from the past closings.
export const useCloseDayHook = () => {
  const [form] = Form.useForm<IDayCloseFormValues>();
  const queryClient = useQueryClient();
  const { showModal, closeModal } = useModalStore();
  const { closePagination, setClosePagination, setViewingClose } = useCloseDayStore();
  const userAccount = useAuthStore((state) => state.userAccount);
  const isOwner = checkIfOwner(userAccount.tokenInfo?.roles);

  const currentQuery = useQuery({ queryKey: DAY_CLOSE_CURRENT_KEY, queryFn: DayCloseService.getCurrent });
  const closeListQuery = useQuery({
    queryKey: [...DAY_CLOSE_LIST_KEY, closePagination],
    queryFn: () => DayCloseService.getPageList(closePagination),
  });
  const current = currentQuery.data;
  const { data: settings } = useStoreSettingsQuery();

  // A new day to close starts an empty count, with the last closing's float filled in.
  // Synced from the query's data (like the settings forms), so it also applies from cache.
  const openDate = current && !current.close ? current.date : null;
  const suggestedFloat = current?.suggestedFloat ?? 0;
  useEffect(() => {
    if (!openDate) return;
    form.resetFields();
    form.setFieldsValue({ openingFloat: suggestedFloat, counts: {}, note: "" });
  }, [openDate, suggestedFloat, form]);

  const openingFloat = Form.useWatch("openingFloat", form);
  const counts = Form.useWatch("counts", form);
  const countedCash = cashTotal(counts);
  const expectedCash = round2((openingFloat ?? 0) + (current?.figures.cashSales ?? 0));

  // Only the owner can reopen, and only the latest closing still in force.
  const canReopen = (dayClose: IDayCloseResponse, isLatest: boolean) =>
    isOwner && isLatest && dayClose.status === DayCloseStatusEnum.closed;

  // `isLatest` is passed straight after closing, before day-close/current has refetched.
  const openZReading = (dayClose: IDayCloseResponse, isLatest = dayClose.id === current?.latestCloseId) => {
    setViewingClose(dayClose);
    showModal({
      properties: {
        open: true,
        centered: true,
        width: 440,
        title: <Text className="!text-[20px] font-semibold">Z reading {dayClose.zNumber}</Text>,
      },
      body: (
        <ZReadingView
          key={`${dayClose.id}-${dayClose.status}`}
          onReopen={canReopen(dayClose, isLatest) ? () => openReopen(dayClose) : undefined}
        />
      ),
    });
  };

  // The reopen form takes the Z reading's place in the same modal, and hands back to it.
  const openReopen = (dayClose: IDayCloseResponse) =>
    showModal({
      properties: {
        open: true,
        centered: true,
        width: 500,
        title: <Text className="!text-[20px] font-semibold">Reopen {formatLongDate(dayClose.date)}</Text>,
      },
      body: (
        <DayReopenForm
          key={dayClose.id}
          dayClose={dayClose}
          onBack={() => openZReading(dayClose, true)}
          onReopened={() => {
            setViewingClose(null);
            closeModal();
          }}
        />
      ),
    });

  const closeMutation = useMutation({
    mutationFn: DayCloseService.create,
    onSuccess: (dayClose: IDayCloseResponse) => {
      queryClient.invalidateQueries(DAY_CLOSE_CURRENT_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_LIST_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_TODAY_KEY);
      Toast.fire({ icon: "success", title: `${formatLongDate(dayClose.date)} is closed.` });
      openZReading(dayClose, true);
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The day couldn't be closed. Try again.") }),
  });

  const handleSubmit = (values: IDayCloseFormValues) => {
    if (!current) return;
    showPopConfirmation({
      title: `Close ${formatLongDate(current.date)}?`,
      text: `${current.isToday ? "No more sales can be made today, and" : "After this,"} its sales can't be voided. The Z reading is saved with the next number.`,
      confirmButtonText: "Close the day",
    }).then((result) => {
      if (!result.isConfirmed) return;
      closeMutation.mutate({
        date: current.date,
        openingFloat: values.openingFloat ?? 0,
        cashCount: CASH_DENOMINATIONS.map((d) => ({ denomination: d.value, qty: values.counts?.[String(d.value)] ?? 0 })).filter(
          (c) => c.qty > 0,
        ),
        note: values.note?.trim() || null,
      });
    });
  };

  const onTableChange = (tableConfig: TablePaginationConfig) =>
    setClosePagination({
      ...closePagination,
      pageNumber: tableConfig.current ?? 1,
      pageSize: tableConfig.pageSize ?? 10,
    });

  return {
    current,
    vatRegistered: settings?.vatRegistered ?? true,
    isLoading: currentQuery.isLoading,
    closeListQuery,
    form,
    counts: counts ?? {},
    countedCash,
    expectedCash,
    overShort: round2(countedCash - expectedCash),
    handleSubmit,
    isClosing: closeMutation.isLoading,
    // The closed-day card offers Reopen to the owner, for the closing shown there.
    canReopenCurrent: !!current?.close && canReopen(current.close, current.close.id === current.latestCloseId),
    openZReading,
    openReopen,
    onTableChange,
  };
};
