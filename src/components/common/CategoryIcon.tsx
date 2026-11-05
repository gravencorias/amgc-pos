import type { IconBaseProps, IconType } from "react-icons";
import {
  LuCakeSlice,
  LuCoffee,
  LuCroissant,
  LuCupSoda,
  LuGlassWater,
  LuIceCreamCone,
  LuPizza,
  LuSalad,
  LuSandwich,
  LuSoup,
} from "react-icons/lu";
import { CategoryIconEnum } from "../../enums/product.enum";

const CATEGORY_ICONS: Record<CategoryIconEnum, IconType> = {
  [CategoryIconEnum.hot]: LuCoffee,
  [CategoryIconEnum.iced]: LuCupSoda,
  [CategoryIconEnum.drink]: LuGlassWater,
  [CategoryIconEnum.pastry]: LuCroissant,
  [CategoryIconEnum.meal]: LuSoup,
  [CategoryIconEnum.sandwich]: LuSandwich,
  [CategoryIconEnum.salad]: LuSalad,
  [CategoryIconEnum.pizza]: LuPizza,
  [CategoryIconEnum.dessert]: LuCakeSlice,
  [CategoryIconEnum.frozen]: LuIceCreamCone,
};

type IProps = IconBaseProps & { icon: CategoryIconEnum | string | undefined };

const CategoryIcon = ({ icon, ...props }: IProps) => {
  const Icon = CATEGORY_ICONS[icon as CategoryIconEnum] ?? LuCoffee;
  return <Icon {...props} />;
};

export default CategoryIcon;
