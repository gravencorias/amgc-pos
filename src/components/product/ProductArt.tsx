import type { CSSProperties } from "react";
import { CategoryIconEnum, categoryIconHue } from "../../enums/product.enum";
import CategoryIcon from "../common/CategoryIcon";

interface IProps {
  photoUrl: string | null | undefined;
  icon: CategoryIconEnum | string | undefined;
  name: string;
  size?: number;
}

// The product's photo, or its category's picture on a tinted square until it has one.
const ProductArt = ({ photoUrl, icon, name, size = 48 }: IProps) => {
  const hue = categoryIconHue[icon as CategoryIconEnum] ?? 30;

  return (
    <span
      className="amgc-product-art"
      style={{ width: size, height: size, "--ph": hue } as CSSProperties}
      aria-label={photoUrl ? `${name} photo` : undefined}
      role={photoUrl ? "img" : undefined}
    >
      {photoUrl ? <img src={photoUrl} alt="" /> : <CategoryIcon icon={icon} size={Math.round(size * 0.46)} aria-hidden />}
    </span>
  );
};

export default ProductArt;
