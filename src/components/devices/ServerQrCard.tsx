import { Alert, Button, Card, QRCode, Radio, Skeleton, Typography } from "antd";
import { RetryIcon } from "../../assets/icons/Icons";
import type { IServerAddressResponse } from "../../models/system/system.response.model";

interface IProps {
  addresses: IServerAddressResponse[];
  selected?: IServerAddressResponse;
  isLoading: boolean;
  isFetching: boolean;
  onSelect: (address: string) => void;
  onRefresh: () => void;
}

// The QR code holds only the app's address, never a sign-in: scanning it opens the sign-in
// screen, and the tablet still needs a PIN or a password.
const ServerQrCard = ({ addresses, selected, isLoading, isFetching, onSelect, onRefresh }: IProps) => {
  return (
    <Card
      title="Connect a tablet or another register"
      extra={
        <Button icon={<RetryIcon />} loading={isFetching && !isLoading} onClick={onRefresh}>
          Refresh
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !selected ? (
        <Alert
          type="warning"
          showIcon
          title="This PC isn't on a network"
          description="Connect it to the store's Wi-Fi or router, then click Refresh."
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start gap-6">
            {/* Black on white whatever the theme: phone cameras read that best. */}
            <QRCode value={selected.url} size={200} color="#000000" bgColor="#ffffff" className="shrink-0" />

            <ol className="amgc-devices__steps">
              <li>Connect the tablet to the store's Wi-Fi, the same network as this PC.</li>
              <li>Open its camera, point it at this code, and tap the link that appears.</li>
              <li>Sign in with a cashier PIN, or a username and password.</li>
              <li>
                For a one-tap icon next time, open the browser's menu and choose <b>Add to Home screen</b>.
              </li>
            </ol>
          </div>

          <div>
            <div className="amgc-devices__label">Or type this address in the tablet's browser</div>
            <Typography.Text copyable={{ text: selected.url }} className="amgc-devices__url">
              {selected.url}
            </Typography.Text>
          </div>

          {addresses.length > 1 && (
            <div>
              <div className="amgc-devices__label">This PC has more than one network. Show the one tablets use:</div>
              <Radio.Group
                value={selected.address}
                onChange={(e) => onSelect(e.target.value)}
                className="flex flex-col gap-2"
                options={addresses.map((a) => ({ value: a.address, label: `${a.adapterName} · ${a.address}` }))}
              />
            </div>
          )}

          <Alert
            type="info"
            showIcon
            title="Keep this address the same"
            description="In your router's settings, reserve this address for this PC (often called a DHCP reservation). Otherwise it can change when the router restarts, and tablets won't find the store."
          />
        </div>
      )}
    </Card>
  );
};

export default ServerQrCard;
