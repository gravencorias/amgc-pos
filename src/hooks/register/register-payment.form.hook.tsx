import { useEffect } from "react";
import { Form, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SALE_LIST_KEY, SALE_SUMMARY_KEY } from "../../constants/constantQueryKeys";
import type { AxiosError } from "axios";
import SaleService from "../../services/sale.service";
import type { IRegisterPaymentFormValues } from "../../models/sale/sale.request.model";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { PaymentMethodEnum } from "../../enums/sale.enum";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { cartGross, computeSaleTotals, focusRegisterSearch, quickCashAmounts } from "../../utils/sale.util";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import SaleReceiptPanel from "../../components/register/SaleReceiptPanel";

const { Text } = Typography;

// .tsx: on success it swaps the modal's body for the receipt.
export const useRegisterPaymentFormHook = () => {
  const [form] = Form.useForm<IRegisterPaymentFormValues>();
  const queryClient = useQueryClient();
  const { showModal, closeModal } = useModalStore();
  const { lines, orderType, tableNo, discount, clearOrder, setLastSale } = useRegisterStore();
  const { data: settings } = useStoreSettingsQuery();

  const totals = computeSaleTotals(cartGross(lines), !!discount, settings?.vatRegistered ?? true);
  const method = (Form.useWatch("method", form) as PaymentMethodEnum | undefined) ?? PaymentMethodEnum.cash;
  const tendered = Form.useWatch("tendered", form) as number | null | undefined;
  // An empty cash box means the exact amount.
  const cash = typeof tendered === "number" ? tendered : totals.total;
  const change = method === PaymentMethodEnum.cash ? Math.round((cash - totals.total) * 100) / 100 : 0;

  useEffect(() => {
    form.setFieldsValue({ method: PaymentMethodEnum.cash, tendered: undefined, reference: "" });
  }, [form]);

  // The cashier types the cash straight away. antd's Modal takes focus as it opens,
  // which beats autoFocus, so focus the box once it has.
  useEffect(() => {
    const id = window.setTimeout(
      () => document.querySelector<HTMLInputElement>(".ant-modal .amgc-payment-focus input, .ant-modal input.amgc-payment-focus")?.focus(),
      120,
    );
    return () => window.clearTimeout(id);
  }, [method]);

  const saleMutation = useMutation({
    mutationFn: SaleService.create,
    onSuccess: (sale: ISaleResponse) => {
      setLastSale(sale);
      clearOrder();
      // The Sales report and Home's snapshot include this sale now.
      queryClient.invalidateQueries(SALE_SUMMARY_KEY);
      queryClient.invalidateQueries(SALE_LIST_KEY);
      showModal({
        properties: {
          open: true,
          centered: true,
          width: 440,
          title: <Text className="!text-[20px] font-semibold">Sale completed</Text>,
        },
        body: <SaleReceiptPanel key={sale.id} />,
      });
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) =>
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The sale couldn't be completed. Try again.") }),
  });

  const handleSubmit = (values: IRegisterPaymentFormValues) => {
    const isCash = values.method === PaymentMethodEnum.cash;
    saleMutation.mutate({
      orderType,
      tableNo: tableNo.trim() || null,
      lines: lines.map((l) => ({
        productId: l.productId,
        sizeName: l.sizeName,
        addOnIds: l.addOns.map((a) => a.id),
        note: l.note,
        qty: l.qty,
      })),
      discount,
      payment: {
        method: values.method,
        tendered: isCash ? (typeof values.tendered === "number" ? values.tendered : totals.total) : totals.total,
        reference: isCash ? null : values.reference?.trim() || null,
      },
    });
  };

  return {
    form,
    totals,
    method,
    change,
    isShort: method === PaymentMethodEnum.cash && change < 0,
    quickAmounts: quickCashAmounts(totals.total),
    setTendered: (amount: number) => form.setFieldValue("tendered", amount),
    handleSubmit,
    handleClose: () => {
      closeModal();
      focusRegisterSearch();
    },
    isCharging: saleMutation.isLoading,
  };
};
