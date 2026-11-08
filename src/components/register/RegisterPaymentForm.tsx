import { Button, Form, Input, InputNumber, Radio, Space, Spin, Typography } from "antd";
import { CardIcon, CashIcon, EwalletIcon } from "../../assets/icons/Icons";
import { PaymentMethodEnum, paymentMethodLabel } from "../../enums/sale.enum";
import { useRegisterPaymentFormHook } from "../../hooks/register/register-payment.form.hook";
import type { IRegisterPaymentFormValues } from "../../models/sale/sale.request.model";
import { pesoAmount } from "../../utils/helpers";
import { peso } from "../../utils/sale.util";
import CashPad from "./CashPad";

const { Text } = Typography;

const METHOD_ICONS = {
  [PaymentMethodEnum.cash]: CashIcon,
  [PaymentMethodEnum.ewallet]: EwalletIcon,
  [PaymentMethodEnum.card]: CardIcon,
};

const RegisterPaymentForm = () => {
  const payment = useRegisterPaymentFormHook();
  const isCash = payment.method === PaymentMethodEnum.cash;

  return (
    <Spin spinning={payment.isCharging}>
      <Form<IRegisterPaymentFormValues>
        form={payment.form}
        layout="vertical"
        requiredMark={false}
        onFinish={payment.handleSubmit}
      >
        <div className="amgc-due">
          <span>Amount due</span>
          <strong className="tabular-nums">{peso(payment.totals.total)}</strong>
        </div>

        <Form.Item name="method" className="!mt-5">
          <Radio.Group className="amgc-choice-group amgc-choice-group--three">
            {Object.values(PaymentMethodEnum).map((value) => {
              const Icon = METHOD_ICONS[value];
              return (
                <Radio.Button key={value} value={value}>
                  <Icon size={20} />
                  <strong>{paymentMethodLabel[value]}</strong>
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>

        {isCash ? (
          <div className={`amgc-payment-cash${payment.isTouch ? " is-touch" : ""}`}>
            <div>
              <Form.Item
                label="Cash received"
                name="tendered"
                extra={payment.isTouch ? undefined : "Leave it empty for the exact amount."}
              >
                <InputNumber
                  size="large"
                  className="!w-full amgc-cash-input amgc-payment-focus"
                  prefix="₱"
                  min={0}
                  precision={2}
                  placeholder={payment.totals.total.toFixed(2)}
                  // Touch mode types with the pad beside it, so tapping the box mustn't raise the tablet's keyboard.
                  inputMode={payment.isTouch ? "none" : "decimal"}
                />
              </Form.Item>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button onClick={() => payment.setTendered(payment.totals.total)}>Exact</Button>
                {payment.quickAmounts.map((amount) => (
                  <Button key={amount} className="tabular-nums" onClick={() => payment.setTendered(amount)}>
                    {pesoAmount(amount)}
                  </Button>
                ))}
              </div>
              <div className={`amgc-change ${payment.isShort ? "is-short" : "is-ok"}`}>
                <span>{payment.isShort ? "Short by" : "Change"}</span>
                <strong className="tabular-nums">{peso(Math.abs(payment.change))}</strong>
              </div>
            </div>
            {payment.isTouch && <CashPad onKey={payment.pressCashKey} />}
          </div>
        ) : (
          <Form.Item
            label="Reference number"
            name="reference"
            extra={
              payment.method === PaymentMethodEnum.card
                ? "Charge the card on the bank terminal first, then complete the sale here."
                : "Check the confirmed payment on the customer's phone, then enter its reference number."
            }
          >
            <Input
              size="large"
              className="amgc-payment-focus"
              placeholder="Optional"
              inputMode="numeric"
              autoComplete="off"
            />
          </Form.Item>
        )}

        <div className="mt-5 flex justify-end">
          <Space>
            <Button size="large" onClick={payment.handleClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={payment.isCharging}
              disabled={payment.isShort}
            >
              Complete sale <kbd className="amgc-kbd amgc-kbd--on-primary !ml-1">Enter</kbd>
            </Button>
          </Space>
        </div>
        {payment.isShort && (
          <Text type="danger" className="mt-2 block text-right">
            Cash received is less than the amount due.
          </Text>
        )}
      </Form>
    </Spin>
  );
};

export default RegisterPaymentForm;
