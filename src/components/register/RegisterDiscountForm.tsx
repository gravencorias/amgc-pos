import { Button, Form, Input, Radio, Space, Typography } from "antd";
import { DiscountKindEnum, discountKindLabel } from "../../enums/sale.enum";
import { useRegisterDiscountFormHook } from "../../hooks/register/register-discount.form.hook";
import type { ISaleDiscountRequest } from "../../models/sale/sale.request.model";

const { Text } = Typography;

const RegisterDiscountForm = () => {
  const { form, hasDiscount, handleSubmit, handleRemove, handleClose } = useRegisterDiscountFormHook();

  return (
    <Form<ISaleDiscountRequest> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      <Form.Item name="kind">
        <Radio.Group className="amgc-choice-group">
          {[DiscountKindEnum.seniorCitizen, DiscountKindEnum.pwd].map((kind) => (
            <Radio.Button key={kind} value={kind}>
              <strong>{discountKindLabel[kind]}</strong>
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="Name on the ID"
        name="name"
        rules={[{ required: true, whitespace: true, message: "Enter the name shown on the ID." }]}
      >
        <Input size="large" autoComplete="off" />
      </Form.Item>
      <Form.Item
        label="ID number"
        name="idNumber"
        rules={[{ required: true, whitespace: true, message: "Enter the ID number shown on the card." }]}
      >
        <Input size="large" autoComplete="off" />
      </Form.Item>
      <Text className="mb-5 block !text-sm !text-[var(--amgc-text-muted)]">
        The 20% comes off the VAT-exempt price. The name and ID number print on the receipt for the customer to sign.
      </Text>
      <div className="flex flex-wrap justify-between gap-3">
        {hasDiscount ? (
          <Button size="large" danger onClick={handleRemove}>
            Remove discount
          </Button>
        ) : (
          <span />
        )}
        <Space>
          <Button size="large" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="primary" size="large" htmlType="submit">
            Apply discount
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default RegisterDiscountForm;
