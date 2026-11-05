import { Button, Checkbox, Col, Form, Input, InputNumber, Row, Space, Spin, Switch, Typography } from "antd";
import { PlusIcon, TrashIcon } from "../../assets/icons/Icons";
import { MAX_PRODUCT_SIZES } from "../../enums/product.enum";
import { useProductFormHook } from "../../hooks/product/product.form.hook";
import type { IProductFormValues } from "../../models/product/product.request.model";
import { pesoAmount } from "../../utils/helpers";
import SelectCategory from "../common/selects/SelectCategory";
import ProductPhotoField from "./ProductPhotoField";

const { Text } = Typography;

const priceRules = [
  { required: true, message: "Enter a price." },
  { type: "number" as const, min: 0.01, message: "Enter a price greater than zero." },
];

const ProductForm = () => {
  const product = useProductFormHook();

  return (
    <Spin spinning={product.isSaving}>
      <Form<IProductFormValues>
        form={product.form}
        layout="vertical"
        requiredMark={false}
        onFinish={product.handleSubmit}
      >
        <Row gutter={[24, 8]}>
          <Col xs={24} md={8}>
            <ProductPhotoField
              photoUrl={product.photoUrl}
              icon={product.photoPreviewIcon}
              name={product.photoPreviewName}
              onPick={product.onPickPhoto}
              onRemove={product.onRemovePhoto}
            />
          </Col>

          <Col xs={24} md={16}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, whitespace: true, message: "Enter the product's name." },
                { max: 40, message: "Keep the name under 40 characters." },
              ]}
            >
              <Input size="large" placeholder="Spanish Latte" autoFocus />
            </Form.Item>

            <Form.Item label="Category" name="categoryId" rules={[{ required: true, message: "Choose a category." }]}>
              <SelectCategory size="large" placeholder="Choose a category" />
            </Form.Item>

            <Form.Item name="hasSizes" valuePropName="checked" className="!mb-3">
              <Switch checkedChildren="Sizes" unCheckedChildren="One price" />
            </Form.Item>

            {product.hasSizes ? (
              <Form.List name="sizes">
                {(fields, { add, remove }) => (
                  <div className="mb-4 flex flex-col gap-2">
                    {fields.map((field, index) => (
                      <div key={field.key} className="flex items-start gap-2">
                        <Form.Item
                          name={[field.name, "name"]}
                          className="!mb-0 flex-1"
                          rules={[{ required: true, whitespace: true, message: "Name the size." }]}
                        >
                          <Input placeholder="16 oz" aria-label={`Size ${index + 1} name`} />
                        </Form.Item>
                        <Form.Item name={[field.name, "price"]} className="!mb-0 w-[140px]" rules={priceRules}>
                          <InputNumber
                            className="!w-full"
                            prefix="₱"
                            min={0}
                            precision={2}
                            aria-label={`Size ${index + 1} price`}
                          />
                        </Form.Item>
                        <Button
                          aria-label={`Remove size ${index + 1}`}
                          icon={<TrashIcon size={15} />}
                          disabled={fields.length < 2}
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    ))}
                    {fields.length < MAX_PRODUCT_SIZES && (
                      <Button
                        className="self-start"
                        size="small"
                        icon={<PlusIcon size={14} />}
                        onClick={() => add({ name: "", price: undefined })}
                      >
                        Add size
                      </Button>
                    )}
                  </div>
                )}
              </Form.List>
            ) : (
              <Form.Item label="Price" name="price" rules={priceRules}>
                <InputNumber size="large" className="!w-[200px]" prefix="₱" min={0} precision={2} />
              </Form.Item>
            )}

            <Form.Item
              label="Add-ons customers can choose"
              name="addOnIds"
              extra={product.addOns.length ? undefined : "No add-ons yet. Add them from the Add-ons panel."}
            >
              <Checkbox.Group className="amgc-addon-checks">
                {product.addOns.map((a) => (
                  <Checkbox key={a.id} value={a.id}>
                    {a.name} <Text className="!text-[var(--amgc-text-muted)]">+{pesoAmount(a.price)}</Text>
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="isAvailable" valuePropName="checked" className="!mb-0">
              <Switch checkedChildren="On the menu" unCheckedChildren="Sold out" />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="end" className="mt-6">
          <Space>
            <Button size="large" onClick={product.handleClose}>
              Cancel
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={product.isSaving}>
              {product.isEditing ? "Save changes" : "Add product"}
            </Button>
          </Space>
        </Row>
      </Form>
    </Spin>
  );
};

export default ProductForm;
