import { useEffect } from "react";
import { Form, Typography } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DAY_CLOSE_CURRENT_KEY,
  DAY_CLOSE_TODAY_KEY,
  SALE_LIST_KEY,
  SALE_SUMMARY_KEY,
} from "../../constants/constantQueryKeys";
import type { AxiosError } from "axios";
import SaleService from "../../services/sale.service";
import type { IRegisterPaymentFormValues } from "../../models/sale/sale.request.model";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { PaymentMethodEnum, SaleStatusEnum } from "../../enums/sale.enum";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { Toast } from "../../utils/http_service";
import { getApiErrorMessage } from "../../utils/helpers";
import { cartGross, computeSaleTotals, focusRegisterSearch, quickCashAmounts } from "../../utils/sale.util";
import { useStoreSettingsQuery } from "../store-settings/store-settings.hook";
import useTouchMode from "../touch/touch.hook";
import SaleReceiptPanel from "../../components/register/SaleReceiptPanel";
import SaleVoidForm from "../../components/sales/SaleVoidForm";
import { openCashDrawerAfterCashSale, printerErrorMessage } from "../../utils/receipt-printer.util";

const { Text } = Typography;

// The receipt after Charge, and the void form that can replace it. Module-level, reading
// the stores directly, because the payment form (and this hook) unmount as soon as the
// receipt takes the modal's place, and these keep swapping the body after that.
const showReceipt = (sale: ISaleResponse) =>
  useModalStore.getState().showModal({
    properties: {
      open: true,
      centered: true,
      width: 440,
      title: (
        <Text className="!text-[20px] font-semibold">
          {sale.status === SaleStatusEnum.voided ? "Sale voided" : "Sale completed"}
        </Text>
      ),
    },
    body: <SaleReceiptPanel key={`${sale.id}-${sale.status}`} onVoid={() => showVoid(sale)} />,
  });

const showVoid = (sale: ISaleResponse) =>
  useModalStore.getState().showModal({
    properties: {
      open: true,
      centered: true,
      width: 520,
      title: <Text className="!text-[20px] font-semibold">Void receipt {sale.receiptNumber}</Text>,
    },
    body: (
      <SaleVoidForm
        key={sale.id}
        sale={sale}
        onBack={() => showReceipt(sale)}
        onVoided={(voided) => {
          useRegisterStore.getState().setLastSale(voided);
          showReceipt(voided);
        }}
      />
    ),
  });

// .tsx: on success it swaps the modal's body for the receipt.
export const useRegisterPaymentFormHook = () => {
  const [form] = Form.useForm<IRegisterPaymentFormValues>();
  const queryClient = useQueryClient();
  const { closeModal } = useModalStore();
  const { lines, orderType, tableNo, discount, clearOrder, setLastSale } = useRegisterStore();
  const { data: settings } = useStoreSettingsQuery();
  const isTouch = useTouchMode();

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
  // which beats autoFocus, so focus the box once it has. Not in touch mode: the number pad
  // is there instead of the on-screen keyboard.
  useEffect(() => {
    if (isTouch) return;
    const id = window.setTimeout(
      () => document.querySelector<HTMLInputElement>(".ant-modal .amgc-payment-focus input, .ant-modal input.amgc-payment-focus")?.focus(),
      120,
    );
    return () => window.clearTimeout(id);
  }, [method, isTouch]);

  // The on-screen number pad (touch mode): whole pesos, typed like a calculator. An amount
  // with centavos (from Exact) starts over on the first key.
  const pressCashKey = (key: string) => {
    const current = form.getFieldValue("tendered") as number | null | undefined;
    const digits = typeof current === "number" && Number.isInteger(current) ? String(current) : "";
    const next = key === "back" ? digits.slice(0, -1) : (digits + key).replace(/^0+(?=\d)/, "").slice(0, 7);
    form.setFieldValue("tendered", next === "" ? undefined : Number(next));
  };

  const saleMutation = useMutation({
    mutationFn: SaleService.create,
    onSuccess: (sale: ISaleResponse) => {
      setLastSale(sale);
      clearOrder();
      // The Sales report and Home's snapshot include this sale now.
      queryClient.invalidateQueries(SALE_SUMMARY_KEY);
      queryClient.invalidateQueries(SALE_LIST_KEY);
      queryClient.invalidateQueries(DAY_CLOSE_CURRENT_KEY);
      showReceipt(sale);
      // Android app with a printer and "Open the cash drawer" on: pop the drawer for the change.
      if (sale.payment.method === PaymentMethodEnum.cash)
        openCashDrawerAfterCashSale().catch((error) =>
          Toast.fire({ icon: "warning", title: `The cash drawer didn't open. ${printerErrorMessage(error)}` }),
        );
    },
    onError: (error: AxiosError<{ message?: string; errors?: { title?: string }[] }>) => {
      // The day may have just been closed from another computer: check, so the Register shows it.
      queryClient.invalidateQueries(DAY_CLOSE_TODAY_KEY);
      Toast.fire({ icon: "error", title: getApiErrorMessage(error, "The sale couldn't be completed. Try again.") });
    },
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
    isTouch,
    pressCashKey,
    handleSubmit,
    handleClose: () => {
      closeModal();
      focusRegisterSearch();
    },
    isCharging: saleMutation.isLoading,
  };
};
