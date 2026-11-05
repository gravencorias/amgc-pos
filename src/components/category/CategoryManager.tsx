import { Button, Empty, Form, Input, List, Radio, Space, Spin, Tooltip, Typography } from "antd";
import { EditIcon, TrashIcon } from "../../assets/icons/Icons";
import { CategoryIconEnum, categoryIconLabel } from "../../enums/product.enum";
import { useCategoryHook } from "../../hooks/category/category.hook";
import { useCategoryFormHook } from "../../hooks/category/category.form.hook";
import type { ICategoryRequest } from "../../models/category/category.request.model";
import CategoryIcon from "../common/CategoryIcon";

const { Text } = Typography;

// Drawer body: a form at the top (add, or edit the one picked below) and the list.
const CategoryManager = () => {
  const { categoriesQuery, editingCategory, setEditingCategory, handleDelete, isDeleting } = useCategoryHook();
  const categoryForm = useCategoryFormHook();

  return (
    <div className="flex flex-col gap-6">
      <Form<ICategoryRequest>
        form={categoryForm.form}
        layout="vertical"
        requiredMark={false}
        onFinish={categoryForm.handleSubmit}
        className="rounded-xl border border-solid border-[var(--amgc-border)] p-4"
      >
        <Text strong className="mb-3 block">
          {categoryForm.isEditing ? `Edit ${editingCategory?.name}` : "Add a category"}
        </Text>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, whitespace: true, message: "Enter the category's name." },
            { max: 30, message: "Keep the name under 30 characters." },
          ]}
        >
          <Input placeholder="Hot coffee" />
        </Form.Item>
        <Form.Item label="Picture for products without a photo" name="icon">
          <Radio.Group className="amgc-icon-picker">
            {Object.values(CategoryIconEnum).map((icon) => (
              <Tooltip key={icon} title={categoryIconLabel[icon]}>
                <Radio.Button value={icon} aria-label={categoryIconLabel[icon]}>
                  <CategoryIcon icon={icon} size={20} aria-hidden />
                </Radio.Button>
              </Tooltip>
            ))}
          </Radio.Group>
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={categoryForm.isSaving}>
            {categoryForm.isEditing ? "Save changes" : "Add category"}
          </Button>
          {categoryForm.isEditing && <Button onClick={categoryForm.handleCancelEdit}>Cancel</Button>}
        </Space>
      </Form>

      <Spin spinning={categoriesQuery.isFetching || isDeleting}>
        <List
          locale={{ emptyText: <Empty description="No categories yet. Add the first one above." /> }}
          dataSource={categoriesQuery.data ?? []}
          renderItem={(category) => (
            <List.Item
              className={editingCategory?.id === category.id ? "amgc-list-item--active" : ""}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  aria-label={`Edit ${category.name}`}
                  icon={<EditIcon size={16} />}
                  onClick={() => setEditingCategory(category)}
                />,
                <Tooltip
                  key="delete"
                  title={category.productCount ? "Move or delete its products first" : undefined}
                >
                  <Button
                    type="text"
                    danger
                    aria-label={`Delete ${category.name}`}
                    icon={<TrashIcon size={16} />}
                    disabled={category.productCount > 0}
                    onClick={() => handleDelete(category)}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--amgc-bg-subtle)]">
                    <CategoryIcon icon={category.icon} size={18} aria-hidden />
                  </span>
                }
                title={category.name}
                description={`${category.productCount} product${category.productCount === 1 ? "" : "s"}`}
              />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default CategoryManager;
