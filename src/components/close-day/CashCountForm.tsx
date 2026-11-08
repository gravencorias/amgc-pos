import { Button, Card, Form, Input, InputNumber, Typography, type FormInstance } from "antd";
import { MinusIcon, PlusIcon } from "../../assets/icons/Icons";
import { CASH_DENOMINATIONS } from "../../constants/constantCash";
import type { IDayCloseFormValues } from "../../models/day-close/day-close.request.model";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

interface IProps {
  form: FormInstance<IDayCloseFormValues>;
  counts: IDayCloseFormValues["counts"];
  cashSales: number;
  expectedCash: number;
  countedCash: number;
  overShort: number;
  isToday: boolean;
  isClosing: boolean;
  // Touch mode: - / + beside each box, so counting a stack is taps rather than typing.
  isTouch: boolean;
  onStep: (denomination: string, delta: number) => void;
  onFinish: (values: IDayCloseFormValues) => void;
}

// Count the drawer by denomination, compare it with what should be there, and close.
const CashCountForm = ({
  form,
  counts,
  cashSales,
  expectedCash,
  countedCash,
  overShort,
  isToday,
  isClosing,
  isTouch,
  onStep,
  onFinish,
}: IProps) => {
  const balance = overShort === 0 ? "is-even" : overShort > 0 ? "is-over" : "is-short";

  return (
    <Card title="Count the cash drawer">
      <Form<IDayCloseFormValues> form={form} layout="vertical" requiredMark={false} onFinish={onFinish}>
        <Form.Item
          label="Starting cash (float)"
          name="openingFloat"
          extra="The change fund the drawer opened with."
          rules={[{ required: true, message: "Enter the starting cash. Use 0 if there was none." }]}
        >
          <InputNumber size="large" min={0} precision={2} prefix="₱" className="!w-full" />
        </Form.Item>

        <Text strong className="mb-2 block">
          What's in the drawer now
        </Text>
        <div className="amgc-cash-count" role="group" aria-label="Cash count by denomination">
          {CASH_DENOMINATIONS.map((d) => {
            const qty = counts?.[String(d.value)] ?? 0;
            return (
              <div key={d.value} className="amgc-cash-count__row">
                <span className="amgc-cash-count__label">{d.label}</span>
                <span className="amgc-cash-count__times" aria-hidden="true">
                  ×
                </span>
                {isTouch ? (
                  <span className="amgc-cash-step">
                    <Button
                      aria-label={`One less ${d.label}`}
                      icon={<MinusIcon size={16} />}
                      disabled={!qty}
                      onClick={() => onStep(String(d.value), -1)}
                    />
                    <Form.Item name={["counts", String(d.value)]} noStyle>
                      <InputNumber
                        min={0}
                        precision={0}
                        controls={false}
                        placeholder="0"
                        inputMode="numeric"
                        aria-label={`Number of ${d.label}`}
                      />
                    </Form.Item>
                    <Button aria-label={`One more ${d.label}`} icon={<PlusIcon size={16} />} onClick={() => onStep(String(d.value), 1)} />
                  </span>
                ) : (
                  <Form.Item name={["counts", String(d.value)]} noStyle>
                    <InputNumber
                      min={0}
                      precision={0}
                      controls={false}
                      placeholder="0"
                      inputMode="numeric"
                      aria-label={`Number of ${d.label}`}
                    />
                  </Form.Item>
                )}
                <span className="amgc-cash-count__amount tabular-nums">{qty ? peso(d.value * qty) : ""}</span>
              </div>
            );
          })}
        </div>

        <dl className="amgc-cash-check">
          <dt>Starting cash</dt>
          <dd>{peso(expectedCash - cashSales)}</dd>
          <dt>Cash sales</dt>
          <dd>{peso(cashSales)}</dd>
          <dt className="is-strong">Should be in the drawer</dt>
          <dd className="is-strong">{peso(expectedCash)}</dd>
          <dt className="is-strong">Counted</dt>
          <dd className="is-strong">{peso(countedCash)}</dd>
        </dl>
        <div className={`amgc-over-short ${balance}`}>
          <span>{overShort === 0 ? "Balanced" : overShort > 0 ? "Over" : "Short"}</span>
          <strong className="tabular-nums">{peso(Math.abs(overShort))}</strong>
        </div>

        <Form.Item label="Note" name="note" className="!mt-4" extra="Optional. Printed on the Z reading, for example why the cash is short.">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={200} />
        </Form.Item>

        <Button type="primary" size="large" block htmlType="submit" loading={isClosing}>
          {isToday ? "Close today" : "Close this day"}
        </Button>
      </Form>
    </Card>
  );
};

export default CashCountForm;
