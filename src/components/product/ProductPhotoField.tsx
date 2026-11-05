import { Button, Typography, Upload } from "antd";
import { TrashIcon, UploadIcon } from "../../assets/icons/Icons";
import type { CategoryIconEnum } from "../../enums/product.enum";
import ProductArt from "./ProductArt";

const { Text } = Typography;

interface IProps {
  photoUrl: string | null;
  icon: CategoryIconEnum | string | undefined;
  name: string;
  onPick: (file: File) => boolean;
  onRemove: () => void;
}

const ProductPhotoField = ({ photoUrl, icon, name, onPick, onRemove }: IProps) => (
  <div className="flex flex-col items-start gap-3">
    <Upload.Dragger
      accept="image/png,image/jpeg,image/webp"
      showUploadList={false}
      beforeUpload={onPick}
      className="amgc-photo-drop"
    >
      <ProductArt photoUrl={photoUrl} icon={icon} name={name || "Product"} size={180} />
      <span className="amgc-photo-drop__cta">
        <UploadIcon size={16} />
        {photoUrl ? "Replace photo" : "Add a photo"}
      </span>
    </Upload.Dragger>
    <Text className="max-w-[200px] !text-xs !text-[var(--amgc-text-muted)]">
      Click or drop a photo. It's cropped to a square. Without one, the category's picture is shown.
    </Text>
    {photoUrl && (
      <Button size="small" icon={<TrashIcon size={14} />} onClick={onRemove}>
        Remove photo
      </Button>
    )}
  </div>
);

export default ProductPhotoField;
