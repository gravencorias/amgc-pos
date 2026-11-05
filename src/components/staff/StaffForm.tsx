import { Alert, Button, Col, Form, Input, Radio, Row, Space, Spin, Typography } from "antd";
import { useStaffFormHook } from "../../hooks/staff/staff.form.hook";
import { UserRoleEnum } from "../../enums/user-role.enum";
import type { IStaffFormValues } from "../../models/staff/staff.request.model";

const { Text } = Typography;

const PIN_PATTERN = /^\d{4,6}$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;

// Adds a cashier or manager, or edits someone's name (and a manager's username).
// PINs and passwords are changed separately, through "Reset PIN" / "Reset password".
const StaffForm = () => {
  const { form, isEditing, editingStaff, isOwner, isCashier, handleClose, handleSubmit, isSaving } =
    useStaffFormHook();

  const matchesField = (field: keyof IStaffFormValues, message: string) => ({
    validator: (_: unknown, value: string) =>
      !value || value === form.getFieldValue(field) ? Promise.resolve() : Promise.reject(new Error(message)),
  });

  return (
    <Spin spinning={isSaving}>
      <Form<IStaffFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
        {isEditing ? (
          <Alert
            className="!mb-5"
            type="info"
            showIcon
            message={`${editingStaff?.roleName} account`}
            description="A role can't be changed. To make a cashier a manager, turn this account off and add them again as a manager."
          />
        ) : (
          <Form.Item label="Role" name="roleCode">
            <Radio.Group className="amgc-role-picker">
              <Radio.Button value={UserRoleEnum.cashier}>
                <strong>Cashier</strong>
                <span>Signs in with a PIN and sells</span>
              </Radio.Button>
              <Radio.Button value={UserRoleEnum.manager} disabled={!isOwner}>
                <strong>Manager</strong>
                <span>{isOwner ? "Uses a password and can change settings" : "Only the owner can add a manager"}</span>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item
          label="Full name"
          name="fullName"
          rules={[
            { required: true, whitespace: true, message: "Enter the person's name." },
            { max: 60, message: "Keep the name under 60 characters." },
          ]}
        >
          <Input size="large" placeholder="Ana Cruz" autoFocus />
        </Form.Item>

        {!isCashier && (
          <Form.Item
            label="Username"
            name="username"
            extra="What they type to sign in. Letters, numbers, dots, dashes or underscores."
            rules={[
              { required: true, message: "Enter a username." },
              { pattern: USERNAME_PATTERN, message: "Use 3 to 30 letters, numbers, dots, dashes or underscores." },
            ]}
          >
            <Input size="large" autoComplete="off" />
          </Form.Item>
        )}

        {!isEditing && isCashier && (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="PIN"
                name="pin"
                extra="4 to 6 digits, different from every other cashier's."
                rules={[
                  { required: true, message: "Enter a PIN." },
                  { pattern: PIN_PATTERN, message: "Use 4 to 6 digits." },
                ]}
              >
                <Input.Password size="large" inputMode="numeric" maxLength={6} autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Type the PIN again"
                name="confirmSecret"
                dependencies={["pin"]}
                rules={[{ required: true, message: "Type the PIN again." }, matchesField("pin", "The PINs don't match.")]}
              >
                <Input.Password size="large" inputMode="numeric" maxLength={6} autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {!isEditing && !isCashier && (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Enter a password." },
                  { min: 8, message: "Use at least 8 characters." },
                ]}
              >
                <Input.Password size="large" autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Type the password again"
                name="confirmSecret"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Type the password again." },
                  matchesField("password", "The passwords don't match."),
                ]}
              >
                <Input.Password size="large" autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {!isEditing && (
          <Text className="block !text-sm !text-[var(--amgc-text-muted)]">
            Tell them their {isCashier ? "PIN" : "password"} in person. Nobody can look it up later, but you can reset it.
          </Text>
        )}

        <Row justify="end" className="mt-6">
          <Space>
            <Button size="large" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={isSaving}>
              {isEditing ? "Save changes" : "Add person"}
            </Button>
          </Space>
        </Row>
      </Form>
    </Spin>
  );
};

export default StaffForm;
