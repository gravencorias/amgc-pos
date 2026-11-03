import { Button, Typography, Upload } from "antd";
import { UploadIcon } from "../../assets/icons/Icons";
import { getInitials } from "../../utils/helpers";

const { Text } = Typography;

interface IProps {
  logoUrl: string | null | undefined;
  storeName: string;
  isUploading: boolean;
  isRemoving: boolean;
  beforeUpload: (file: File) => boolean;
  onRemove: () => void;
}

const LogoUploader = ({ logoUrl, storeName, isUploading, isRemoving, beforeUpload, onRemove }: IProps) => (
  <div className="flex flex-wrap items-center gap-5">
    <div className="amgc-logo-box">{logoUrl ? <img src={logoUrl} alt={`${storeName} logo`} /> : getInitials(storeName)}</div>
    <div className="flex min-w-[220px] flex-1 flex-col gap-3">
      <Text className="!text-[var(--amgc-text-muted)]">
        PNG, JPG or WebP. It's cropped to a square and resized, so any photo of the logo works. A transparent PNG looks
        best.
      </Text>
      <div className="flex flex-wrap gap-2">
        <Upload accept="image/png,image/jpeg,image/webp" showUploadList={false} beforeUpload={beforeUpload}>
          <Button icon={<UploadIcon size={18} />} loading={isUploading}>
            {logoUrl ? "Replace logo" : "Upload logo"}
          </Button>
        </Upload>
        {logoUrl && (
          <Button danger loading={isRemoving} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default LogoUploader;
