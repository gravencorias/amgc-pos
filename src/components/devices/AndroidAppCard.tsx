import { Card, QRCode, Typography } from "antd";

interface IProps {
  // The APK's full address on the address the QR code above shows, or undefined without an APK.
  apkUrl?: string;
  version?: string;
}

// The Android app ships inside the store's setup package, so tablets download it from this PC.
const AndroidAppCard = ({ apkUrl, version }: IProps) => (
  <Card title="Android app">
    {!apkUrl ? (
      <p className="amgc-devices__note">
        This server has no Android app to hand out. It comes with the store's setup package; until then, tablets
        can use the QR code above in their browser.
      </p>
    ) : (
      <div className="flex flex-wrap items-start gap-6">
        <QRCode value={apkUrl} size={160} color="#000000" bgColor="#ffffff" className="shrink-0" />
        <ol className="amgc-devices__steps">
          <li>On the tablet, scan this code and download the app (version {version}).</li>
          <li>
            Open the download. If Android asks, allow installing apps from the browser, then tap <b>Install</b>.
          </li>
          <li>Open AMGC POS and scan the QR code above to connect it to the store.</li>
          <li>
            After every update of this PC, install the new app the same way. The tablet says when it's needed.
          </li>
          <li className="list-none">
            <Typography.Text copyable={{ text: apkUrl }} className="amgc-devices__note">
              {apkUrl}
            </Typography.Text>
          </li>
        </ol>
      </div>
    )}
  </Card>
);

export default AndroidAppCard;
