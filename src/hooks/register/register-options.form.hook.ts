import { useEffect } from "react";
import { Form } from "antd";
import type { IRegisterOptionsFormValues } from "../../models/sale/sale.request.model";
import { NOTE_PRESETS } from "../../constants/constantReceipt";
import { useModalStore } from "../../stores/common/modal.store";
import { useRegisterStore } from "../../stores/data/register.store";
import { cartLineKey, focusRegisterSearch } from "../../utils/sale.util";
import { useAddOnsQuery } from "../add-on/add-on.hook";

// The picker for a product with sizes or add-ons. Number keys 1–9 choose the size,
// + and − change the quantity, Enter adds it to the order.
export const useRegisterOptionsFormHook = () => {
  const [form] = Form.useForm<IRegisterOptionsFormValues>();
  const { closeModal } = useModalStore();
  const { optionProduct: product, setOptionProduct, addLine } = useRegisterStore();
  const addOnsQuery = useAddOnsQuery();

  const addOns = (addOnsQuery.data ?? []).filter((a) => product?.addOnIds.includes(a.id));
  const notePresets = product ? NOTE_PRESETS[product.categoryIcon] ?? [] : [];

  const values = Form.useWatch([], form) as Partial<IRegisterOptionsFormValues> | undefined;
  const size = product?.sizes.find((s) => s.name === values?.sizeName);
  const chosenAddOns = addOns.filter((a) => values?.addOnIds?.includes(a.id));
  const qty = values?.qty ?? 1;
  const unitPrice = (size?.price ?? product?.price ?? 0) + chosenAddOns.reduce((sum, a) => sum + a.price, 0);

  useEffect(() => {
    form.setFieldsValue({ sizeName: product?.sizes[0]?.name, addOnIds: [], notes: [], otherNote: "", qty: 1 });
  }, [product, form]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input[type='text'], textarea, .ant-input-number")) return;
      if (/^[1-9]$/.test(e.key) && product.sizes[Number(e.key) - 1]) {
        e.preventDefault();
        form.setFieldValue("sizeName", product.sizes[Number(e.key) - 1].name);
      } else if (e.key === "+" || e.key === "=" || e.key === "-") {
        e.preventDefault();
        const current = form.getFieldValue("qty") ?? 1;
        form.setFieldValue("qty", Math.max(1, Math.min(99, current + (e.key === "-" ? -1 : 1))));
      } else if (e.key === "Enter" && !target?.closest("button")) {
        e.preventDefault();
        form.submit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [product, form]);

  const handleClose = () => {
    setOptionProduct(null);
    closeModal();
    focusRegisterSearch();
  };

  const handleSubmit = (formValues: IRegisterOptionsFormValues) => {
    if (!product) return;
    const note = [...(formValues.notes ?? []), formValues.otherNote?.trim()].filter(Boolean).join(", ") || null;
    const sizeName = product.sizes.length ? (formValues.sizeName ?? product.sizes[0].name) : null;
    const lineAddOns = addOns.filter((a) => formValues.addOnIds?.includes(a.id));
    addLine({
      key: cartLineKey(product.id, sizeName, lineAddOns.map((a) => a.id), note),
      productId: product.id,
      name: product.name,
      categoryIcon: product.categoryIcon,
      photoUrl: product.photoUrl,
      sizeName,
      addOns: lineAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      note,
      unitPrice: (product.sizes.find((s) => s.name === sizeName)?.price ?? product.price) +
        lineAddOns.reduce((sum, a) => sum + a.price, 0),
      qty: formValues.qty ?? 1,
    });
    handleClose();
  };

  return { form, product, addOns, notePresets, unitPrice, qty, handleClose, handleSubmit };
};
