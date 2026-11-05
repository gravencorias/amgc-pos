import { Select, type SelectProps } from "antd";
import { useCategoriesQuery } from "../../../hooks/category/category.hook";
import CategoryIcon from "../CategoryIcon";

// Drops into a Form.Item like a plain Select. Shares the categories-all cache with the rest of the menu.
const SelectCategory = (selectProps: SelectProps<number>) => {
  const categoriesQuery = useCategoriesQuery();

  return (
    <Select<number>
      {...selectProps}
      loading={categoriesQuery.isLoading}
      options={(categoriesQuery.data ?? []).map((c) => ({
        value: c.id,
        label: (
          <span className="inline-flex items-center gap-2">
            <CategoryIcon icon={c.icon} size={15} aria-hidden />
            {c.name}
          </span>
        ),
      }))}
    />
  );
};

export default SelectCategory;
