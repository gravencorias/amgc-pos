import { Alert, Button, Divider, Form, Input, Typography } from "antd";
import { ScanIcon, ServerIcon } from "../../assets/icons/Icons";
import { useConnectHook } from "../../hooks/connect/connect.hook";
import { getInitials } from "../../utils/helpers";

const { Title, Text } = Typography;

// Android app only, before sign-in: shown by View.tsx while no store server is saved, or after
// "Change server" on the sign-in screen.
const ConnectServer = () => {
  const connect = useConnectHook();
  const { found } = connect;

  return (
    <div className="amgc-connect">
      <div className="amgc-connect__card">
        {found ? (
          <>
            <div className="amgc-connect__store">
              <div className="amgc-connect__mark">
                {found.logoUrl ? <img src={found.logoUrl} alt="" /> : getInitials(found.storeName)}
              </div>
              <div>
                <Title level={3} className="!m-0">
                  Connect to {found.storeName}?
                </Title>
                <Text className="!text-[var(--amgc-text-muted)]">{found.serverUrl.replace(/^http:\/\//, "")}</Text>
              </div>
            </div>
            {connect.versionMismatch && (
              <Alert
                type="warning"
                showIcon
                className="!mb-4"
                title="This app doesn't match the store's server"
                description={`This tablet has version ${connect.appVersion}; the store runs ${found.version}. After connecting, install the matching app from the banner at the bottom.`}
              />
            )}
            <div className="flex flex-col gap-3">
              <Button type="primary" size="large" block onClick={connect.confirm}>
                Connect
              </Button>
              <Button size="large" block onClick={connect.back}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="amgc-connect__icon" aria-hidden="true">
              <ServerIcon size={30} />
            </span>
            <Title level={2} className="!mb-1">
              Connect to your store
            </Title>
            <Text className="block !text-[var(--amgc-text-muted)]">
              This tablet works with the store's main PC. On that PC, open <b>Settings → Devices</b> and scan the QR
              code there.
            </Text>

            <Button
              type="primary"
              size="large"
              block
              icon={<ScanIcon />}
              className="!mt-6"
              loading={connect.isFinding}
              onClick={connect.scan}
            >
              Scan the QR code
            </Button>

            <Divider plain className="!my-6">
              or type its address
            </Divider>

            <Form form={connect.form} layout="vertical" requiredMark={false} onFinish={connect.onFinish}>
              <Form.Item
                name="address"
                label="Main PC's address"
                extra="Shown under the QR code, for example 192.168.1.10:5000."
                rules={[{ required: true, whitespace: true, message: "Enter the main PC's address." }]}
              >
                <Input size="large" placeholder="192.168.1.10:5000" inputMode="url" autoComplete="off" />
              </Form.Item>
              <Button size="large" block htmlType="submit" loading={connect.isFinding}>
                Connect
              </Button>
            </Form>

            {connect.canCancel && (
              <Button type="link" block className="!mt-4" onClick={connect.cancel}>
                Keep using {connect.currentServer?.replace(/^http:\/\//, "")}
              </Button>
            )}
          </>
        )}
        <p className="amgc-connect__version">AMGC POS {connect.appVersion}</p>
      </div>
    </div>
  );
};

export default ConnectServer;
