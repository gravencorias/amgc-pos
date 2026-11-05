import { Button, Checkbox, Form, Input, InputNumber, Radio, Space, Typography } from "antd";
import { useRegisterOptionsFormHook } from "../../hooks/register/register-options.form.hook";
import type { IRegisterOptionsFormValues } from "../../models/sale/sale.request.model";
import { pesoAmount } from "../../utils/helpers";
import { peso } from "../../utils/sale.util";
import ProductArt from "../product/ProductArt";

const { Text } = Typography;

const RegisterOptionsForm = () => {
  const { form, product, addOns, notePresets, unitPrice, qty, handleClose, handleSubmit } =
    useRegisterOptionsFormHook();
  if (!product) return null;

  return (
    <Form<IRegisterOptionsFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      <div className="mb-5 flex items-center gap-4">
        <ProductArt photoUrl={product.photoUrl} icon={product.categoryIcon} name={product.name} size={64} />
        <div>
          <Text strong className="block !text-[16px]">
            {product.name}
          </Text>
          <Text className="!text-[var(--amgc-text-muted)]">{product.categoryName}</Text>
        </div>
      </div>

      {product.sizes.length > 0 && (
        <Form.Item label="Size" name="sizeName">
          <Radio.Group className="amgc-choice-group">
            {product.sizes.map((s, i) => (
              <Radio.Button key={s.name} value={s.name}>
                <strong>{s.name}</strong>
                <span>{pesoAmount(s.price)}</span>
                {i < 9 && <kbd className="amgc-kbd">{i + 1}</kbd>}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      )}

      {addOns.length > 0 && (
        <Form.Item label="Add-ons" name="addOnIds">
          <Checkbox.Group className="amgc-addon-checks">
            {addOns.map((a) => (
              <Checkbox key={a.id} value={a.id}>
                {a.name} <Text className="!text-[var(--amgc-text-muted)]">+{pesoAmount(a.price)}</Text>
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      )}

      <Form.Item label="Note for the kitchen or barista" className="!mb-3">
        {notePresets.length > 0 && (
          <Form.Item name="notes" noStyle>
            <Checkbox.Group className="amgc-note-chips" options={notePresets} />
          </Form.Item>
        )}
        <Form.Item name="otherNote" noStyle>
          <Input className="!mt-2" maxLength={60} placeholder="Other request (optional)" />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Quantity" name="qty">
        <InputNumber min={1} max={99} size="large" className="!w-[120px]" />
      </Form.Item>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text className="!text-xs !text-[var(--amgc-text-muted)]">
          Number keys choose the size, + and − change the quantity, Enter adds.
        </Text>
        <Space>
          <Button size="large" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="primary" size="large" htmlType="submit">
            Add {qty > 1 ? `${qty} ` : ""}to order, {peso(unitPrice * qty)}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default RegisterOptionsForm;
