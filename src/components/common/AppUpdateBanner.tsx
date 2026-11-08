import { Button } from "antd";
import { DownloadIcon } from "../../assets/icons/Icons";

interface IProps {
  appVersion: string;
  serverVersion?: string;
  onDownload?: () => void;
}

// The Android app and the store's server have different versions (useAppUpdateHook).
const AppUpdateBanner = ({ appVersion, serverVersion, onDownload }: IProps) => (
  <div className="amgc-update-banner" role="status">
    <p>
      <b>Update this tablet's app.</b> It has version {appVersion}; the store's server runs {serverVersion}.
      {!onDownload && " Ask the owner for the new app."}
    </p>
    {onDownload && (
      <Button type="primary" icon={<DownloadIcon />} onClick={onDownload}>
        Download the update
      </Button>
    )}
  </div>
);

export default AppUpdateBanner;
