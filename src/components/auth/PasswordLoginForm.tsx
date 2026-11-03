import { Button, Form, Input, type FormInstance } from "antd";
import type { IPasswordLoginRequest } from "../../models/auth/authentication.request";

interface IProps {
  form: FormInstance<IPasswordLoginRequest>;
  isLoading: boolean;
  onFinish: (values: IPasswordLoginRequest) => void;
}

const PasswordLoginForm = ({ form, isLoading, onFinish }: IProps) => (
  <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish} autoComplete="on">
    <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username." }]}>
      <Input size="large" autoFocus autoComplete="username" />
    </Form.Item>
    <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password." }]}>
      <Input.Password size="large" autoComplete="current-password" />
    </Form.Item>
    <Button type="primary" size="large" block htmlType="submit" loading={isLoading}>
      Sign in
    </Button>
  </Form>
);

export default PasswordLoginForm;
