import { Tag } from "antd";
import { AllCategoriesIcon } from "../../assets/icons/Icons";
import CategoryIcon from "./CategoryIcon";

interface IProps {
  label: string;
  count: number;
  // The category's icon. Leave it out for the "All" chip, which gets a grid icon.
  icon?: string;
  checked: boolean;
  onChange: () => void;
}

// A category filter pill: icon in a tinted circle, the name, and a count badge. Used by
// the Register's menu and the Products page.
const CategoryChip = ({ label, count, icon, checked, onChange }: IProps) => (
  <Tag.CheckableTag className="amgc-cat-chip" checked={checked} onChange={onChange}>
    <span className="amgc-cat-chip__icon" aria-hidden="true">
      {icon === undefined ? <AllCategoriesIcon size={15} /> : <CategoryIcon icon={icon} size={15} />}
    </span>
    {label}
    <span className="amgc-cat-chip__count">{count}</span>
  </Tag.CheckableTag>
);

export default CategoryChip;
