import { Alert, Button, Form, Input, Tag, Typography } from "antd";
import { PaymentMethodEnum, paymentMethodLabel, VOID_REASON_PRESETS } from "../../enums/sale.enum";
import { useSaleVoidFormHook, type ISaleVoidFormProps } from "../../hooks/sales/sale-void.form.hook";
import type { ISaleVoidFormValues } from "../../models/sale/sale.request.model";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import { formatTime } from "../../utils/date.util";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

// What to hand back to the customer, by how this sale was paid. The register records an
// e-wallet payment only as "GCash or Maya", so the reference number (when the cashier
// entered one) is what finds the original transaction.
const refundNote = ({ payment, totals }: ISaleResponse) => {
  const ref = payment.reference ? ` (ref. ${payment.reference})` : "";
  if (payment.method === PaymentMethodEnum.cash) return `Give ${peso(totals.total)} cash back to the customer.`;
  if (payment.method === PaymentMethodEnum.card) return `Refund ${peso(totals.total)} to the customer's card${ref}.`;
  return `Send ${peso(totals.total)} back to the customer's ${paymentMethodLabel[payment.method]} account${ref}.`;
};

const SaleVoidForm = (props: ISaleVoidFormProps) => {
  const { form, needsApproval, reason, pickReason, handleSubmit, handleBack, isVoiding } = useSaleVoidFormHook(props);
  const { sale } = props;

  return (
    <Form<ISaleVoidFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      <div className="amgc-void-sale">
        <span>
          Receipt <strong className="tabular-nums">{sale.receiptNumber}</strong> · {formatTime(sale.createdAt)} ·{" "}
          {sale.cashierName}
        </span>
        <strong className="tabular-nums">{peso(sale.totals.total)}</strong>
      </div>

      <Form.Item
        label="Why is it being voided?"
        name="reason"
        className="!mb-2"
        rules={[
          { required: true, whitespace: true, message: "Say why the sale is being voided." },
          { min: 3, message: "Say a little more about why." },
        ]}
      >
        <Input.TextArea className="amgc-focus-first" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={200} />
      </Form.Item>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Common reasons">
        {VOID_REASON_PRESETS.map((preset) => (
          <Tag.CheckableTag key={preset} className="amgc-reason-chip" checked={reason === preset} onChange={() => pickReason(preset)}>
            {preset}
          </Tag.CheckableTag>
        ))}
      </div>

      {needsApproval && (
        <div className="amgc-void-approval">
          <Text strong className="block">
            Manager approval
          </Text>
          <Text className="mb-3 block !text-sm !text-[var(--amgc-text-muted)]">
            An owner or manager enters their own username and password to approve.
          </Text>
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Form.Item
              label="Username"
              name="approverUsername"
              rules={[{ required: true, whitespace: true, message: "Enter the approver's username." }]}
            >
              <Input size="large" autoComplete="off" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="approverPassword"
              rules={[{ required: true, message: "Enter the approver's password." }]}
            >
              <Input.Password size="large" autoComplete="new-password" />
            </Form.Item>
          </div>
        </div>
      )}

      <Alert
        type="warning"
        showIcon
        className="!mb-5"
        title={refundNote(sale)}
        description="This can't be undone. The receipt stays on record, marked void, and leaves the day's totals."
      />

      <div className="flex flex-wrap justify-between gap-2">
        <Button size="large" onClick={handleBack} disabled={isVoiding}>
          Back to receipt
        </Button>
        <Button type="primary" danger size="large" htmlType="submit" loading={isVoiding}>
          Void sale
        </Button>
      </div>
    </Form>
  );
};

export default SaleVoidForm;
