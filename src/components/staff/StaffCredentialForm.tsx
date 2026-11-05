import { Button, Col, Form, Input, Row, Space, Spin, Typography } from "antd";
import { useStaffCredentialFormHook } from "../../hooks/staff/staff-credential.form.hook";
import type { IStaffCredentialFormValues } from "../../models/staff/staff.request.model";

const { Text } = Typography;

// Sets a new PIN or password. The old one can't be shown: the API only keeps a hash.
const StaffCredentialForm = () => {
  const { form, kind, isSelf, credentialStaff, handleClose, handleSubmit, isSaving } = useStaffCredentialFormHook();
  const isPin = kind === "pin";
  const name = credentialStaff?.fullName ?? "This person";
  const label = isPin ? "PIN" : "password";

  return (
    <Spin spinning={isSaving}>
      <Form<IStaffCredentialFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
        <Text className="mb-5 block !text-[var(--amgc-text-muted)]">
          {isSelf
            ? "Your new password works the next time you sign in. You stay signed in on this computer."
            : `${name}'s old ${label} stops working right away. Tell them the new one in person.`}
        </Text>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={`New ${label}`}
              name="secret"
              extra={isPin ? "4 to 6 digits, different from every other cashier's." : "At least 8 characters."}
              rules={[
                { required: true, message: `Enter the new ${label}.` },
                isPin ? { pattern: /^\d{4,6}$/, message: "Use 4 to 6 digits." } : { min: 8, message: "Use at least 8 characters." },
              ]}
            >
              <Input.Password
                size="large"
                autoFocus
                inputMode={isPin ? "numeric" : undefined}
                maxLength={isPin ? 6 : undefined}
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={`Type the ${label} again`}
              name="confirmSecret"
              dependencies={["secret"]}
              rules={[
                { required: true, message: `Type the ${label} again.` },
                {
                  validator: (_, value: string) =>
                    !value || value === form.getFieldValue("secret")
                      ? Promise.resolve()
                      : Promise.reject(new Error(`The ${label}s don't match.`)),
                },
              ]}
            >
              <Input.Password
                size="large"
                inputMode={isPin ? "numeric" : undefined}
                maxLength={isPin ? 6 : undefined}
                autoComplete="new-password"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" className="mt-2">
          <Space>
            <Button size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={isSaving}>
              Save new {label}
            </Button>
          </Space>
        </Row>
      </Form>
    </Spin>
  );
};

export default StaffCredentialForm;
