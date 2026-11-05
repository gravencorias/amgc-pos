import { useEffect } from "react";
import { Form } from "antd";
import type { ISaleDiscountRequest } from "../../models/sale/sale.request.model";
import { DiscountKindEnum } from "../../enums/sale.enum";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { focusRegisterSearch } from "../../utils/sale.util";

// The name and ID number print on the receipt, where the customer signs.
export const useRegisterDiscountFormHook = () => {
  const [form] = Form.useForm<ISaleDiscountRequest>();
  const { closeModal } = useModalStore();
  const { discount, setDiscount } = useRegisterStore();

  useEffect(() => {
    form.setFieldsValue(discount ?? { kind: DiscountKindEnum.seniorCitizen, name: "", idNumber: "" });
  }, [discount, form]);

  // antd's Modal takes focus as it opens, which beats autoFocus; focus the name once it has.
  useEffect(() => {
    const id = window.setTimeout(() => form.getFieldInstance("name")?.focus?.(), 120);
    return () => window.clearTimeout(id);
  }, [form]);

  const close = () => {
    closeModal();
    focusRegisterSearch();
  };

  return {
    form,
    hasDiscount: !!discount,
    handleSubmit: (values: ISaleDiscountRequest) => {
      setDiscount({ kind: values.kind, name: values.name.trim(), idNumber: values.idNumber.trim() });
      close();
    },
    handleRemove: () => {
      setDiscount(null);
      close();
    },
    handleClose: close,
  };
};
