import { Alert, Button, Form, Input } from "antd";
import { useDayReopenFormHook, type IDayReopenFormProps } from "../../hooks/close-day/day-reopen.form.hook";
import type { IDayReopenFormValues } from "../../models/day-close/day-close.request.model";
import { formatLongDate } from "../../utils/date.util";

const DayReopenForm = (props: IDayReopenFormProps) => {
  const { form, handleSubmit, handleBack, isReopening } = useDayReopenFormHook(props);
  const { dayClose } = props;

  return (
    <Form<IDayReopenFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      <Alert
        type="warning"
        showIcon
        className="!mb-5"
        title={`Z reading ${dayClose.zNumber} stays on record, marked reopened.`}
        description={`${formatLongDate(dayClose.date)} opens again for voids, and for sales if it's today. Close it again when you're done: that saves a new Z reading with the next number.`}
      />
      <Form.Item
        label="Why is the day being reopened?"
        name="reason"
        rules={[
          { required: true, whitespace: true, message: "Say why the day is being reopened." },
          { min: 3, message: "Say a little more about why." },
        ]}
      >
        <Input.TextArea
          className="amgc-focus-first"
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={200}
          placeholder="For example: closed too early, a customer came in"
        />
      </Form.Item>
      <div className="flex flex-wrap justify-between gap-2">
        <Button size="large" onClick={handleBack} disabled={isReopening}>
          Back to Z reading
        </Button>
        <Button type="primary" danger size="large" htmlType="submit" loading={isReopening}>
          Reopen the day
        </Button>
      </div>
    </Form>
  );
};

export default DayReopenForm;
