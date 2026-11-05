import { Button, Empty, Form, Input, InputNumber, List, Space, Spin, Typography } from "antd";
import { EditIcon, TrashIcon } from "../../assets/icons/Icons";
import { useAddOnHook } from "../../hooks/add-on/add-on.hook";
import { useAddOnFormHook } from "../../hooks/add-on/add-on.form.hook";
import type { IAddOnRequest } from "../../models/add-on/add-on.request.model";
import { pesoAmount } from "../../utils/helpers";

const { Text } = Typography;

// Drawer body: the store-wide list of add-ons that products can offer.
const AddOnManager = () => {
  const { addOnsQuery, editingAddOn, setEditingAddOn, handleDelete, isDeleting } = useAddOnHook();
  const addOnForm = useAddOnFormHook();

  return (
    <div className="flex flex-col gap-6">
      <Form<IAddOnRequest>
        form={addOnForm.form}
        layout="vertical"
        requiredMark={false}
        onFinish={addOnForm.handleSubmit}
        className="rounded-xl border border-solid border-[var(--amgc-border)] p-4"
      >
        <Text strong className="mb-3 block">
          {addOnForm.isEditing ? `Edit ${editingAddOn?.name}` : "Add an add-on"}
        </Text>
        <div className="flex flex-wrap gap-3">
          <Form.Item
            label="Name"
            name="name"
            className="min-w-[180px] flex-1"
            rules={[
              { required: true, whitespace: true, message: "Enter the add-on's name." },
              { max: 30, message: "Keep the name under 30 characters." },
            ]}
          >
            <Input placeholder="Extra shot" />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Enter a price. Use 0 if it's free." }]}
          >
            <InputNumber className="!w-[130px]" prefix="₱" min={0} precision={2} />
          </Form.Item>
        </div>
        <Space>
          <Button type="primary" htmlType="submit" loading={addOnForm.isSaving}>
            {addOnForm.isEditing ? "Save changes" : "Add add-on"}
          </Button>
          {addOnForm.isEditing && <Button onClick={addOnForm.handleCancelEdit}>Cancel</Button>}
        </Space>
      </Form>

      <Spin spinning={addOnsQuery.isFetching || isDeleting}>
        <List
          locale={{ emptyText: <Empty description="No add-ons yet. Add the first one above." /> }}
          dataSource={addOnsQuery.data ?? []}
          renderItem={(addOn) => (
            <List.Item
              className={editingAddOn?.id === addOn.id ? "amgc-list-item--active" : ""}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  aria-label={`Edit ${addOn.name}`}
                  icon={<EditIcon size={16} />}
                  onClick={() => setEditingAddOn(addOn)}
                />,
                <Button
                  key="delete"
                  type="text"
                  danger
                  aria-label={`Delete ${addOn.name}`}
                  icon={<TrashIcon size={16} />}
                  onClick={() => handleDelete(addOn)}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    {addOn.name} <Text className="!text-[var(--amgc-text-muted)]">+{pesoAmount(addOn.price)}</Text>
                  </span>
                }
                description={
                  addOn.productCount
                    ? `Offered on ${addOn.productCount} product${addOn.productCount === 1 ? "" : "s"}`
                    : "Not on any product yet"
                }
              />
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default AddOnManager;
