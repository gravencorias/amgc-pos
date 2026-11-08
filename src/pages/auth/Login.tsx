import { Button, Segmented, Typography } from "antd";
import PinPad from "../../components/auth/PinPad";
import PasswordLoginForm from "../../components/auth/PasswordLoginForm";
import LoginLoungeIllustration from "../../components/auth/LoginLoungeIllustration";
import { useLoginHook } from "../../hooks/auth/login.hook";
import type { LoginMethod } from "../../stores/data/login.store";
import { getInitials } from "../../utils/helpers";

const { Title, Text } = Typography;

const Login = () => {
  const login = useLoginHook();
  const storeName = login.storeBranding?.storeName ?? "AMGC POS";

  return (
    <div className="amgc-login">
      <section className="amgc-login__brand">
        <div className="amgc-login__heading">
          <div className="amgc-login__mark">
            {login.storeBranding?.logoUrl ? <img src={login.storeBranding.logoUrl} alt="" /> : getInitials(storeName)}
          </div>
          <div>
            <h1 className="amgc-login__store">{storeName}</h1>
            <p className="amgc-login__date">
              {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <p className="amgc-login__powered">Powered by AMGC POS</p>
        <LoginLoungeIllustration lampOn={login.lampOn} onToggleLamp={login.toggleLamp} />
      </section>

      <section className="amgc-login__panel">
        <div className="amgc-login__card">
          <Title level={2} className="!mb-1">
            Sign in
          </Title>
          <Text className="block !text-[var(--amgc-text-muted)]">
            {login.method === "pin" ? "Cashiers start a shift with their PIN." : "Owners and managers use their account."}
          </Text>

          <Segmented<LoginMethod>
            block
            size="large"
            className="!my-6"
            value={login.method}
            onChange={login.setMethod}
            options={[
              { label: "Cashier PIN", value: "pin" },
              { label: "Owner or manager", value: "password" },
            ]}
          />

          {login.method === "pin" ? (
            <PinPad
              pin={login.pin}
              maxLength={login.pinMaxLength}
              rejected={login.pinRejected}
              canSubmit={login.canSubmitPin}
              isLoading={login.isPinLoading}
              onDigit={login.pressDigit}
              onBackspace={login.backspace}
              onClear={login.clearPin}
              onSubmit={login.submitPin}
            />
          ) : (
            <PasswordLoginForm
              form={login.passwordForm}
              isLoading={login.isPasswordLoading}
              onFinish={login.onPasswordFinish}
            />
          )}

          {login.serverAddress && (
            <p className="amgc-login__server">
              Store server {login.serverAddress} ·{" "}
              <Button type="link" size="small" className="!p-0" onClick={login.changeServer}>
                Change
              </Button>
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Login;
