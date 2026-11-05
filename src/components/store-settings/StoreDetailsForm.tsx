import { Button, Card, Col, Form, Input, Row, Switch, type FormInstance } from "antd";
import type { IStoreDetailsFormValues } from "../../models/store-settings/store-settings.request.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import ReceiptHeaderPreview from "./ReceiptHeaderPreview";

interface IProps {
  form: FormInstance<IStoreDetailsFormValues>;
  storeSettings?: IStoreSettingsResponse;
  values?: Partial<IStoreDetailsFormValues>;
  isDirty: boolean;
  isSaving: boolean;
  onFinish: (values: IStoreDetailsFormValues) => void;
}

const TIN_PATTERN = /^\d{3}-\d{3}-\d{3}(-\d{3,5})?$/;

const StoreDetailsForm = ({ form, storeSettings, values, isDirty, isSaving, onFinish }: IProps) => {
  return (
    <Form form={form} layout="vertical" requiredMark="optional" onFinish={onFinish}>
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={15} className="flex flex-col gap-6">
          <Card title="Store">
            <Form.Item
              label="Store name"
              name="storeName"
              rules={[
                { required: true, whitespace: true, message: "Enter the store's name." },
                { max: 60, message: "Keep the name under 60 characters." },
              ]}
            >
              <Input size="large" placeholder="Tambayan Café" />
            </Form.Item>
            <Form.Item label="Tagline" name="tagline" rules={[{ max: 80, message: "Keep the tagline under 80 characters." }]}>
              <Input placeholder="Coffee, rice meals, and long talks" />
            </Form.Item>
            <Form.Item label="Address" name="address" rules={[{ max: 160, message: "Keep the address under 160 characters." }]}>
              <Input.TextArea rows={2} placeholder="123 Rizal St., Davao City" />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} md={14}>
                <Form.Item
                  label="TIN"
                  name="tin"
                  rules={[{ pattern: TIN_PATTERN, message: "Use the format 000-000-000-00000." }]}
                >
                  <Input placeholder="000-000-000-00000" inputMode="numeric" />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item label="VAT-registered" name="vatRegistered" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Receipt">
            <Form.Item
              label="Message at the bottom"
              name="receiptFooter"
              rules={[{ max: 80, message: "Keep the message under 80 characters." }]}
            >
              <Input placeholder="Salamat po! Come again." />
            </Form.Item>
            <Form.Item label="Print the logo on receipts" name="showLogoOnReceipt" valuePropName="checked" className="!mb-0">
              <Switch />
            </Form.Item>
          </Card>

          <div className="flex justify-end">
            <Button type="primary" size="large" htmlType="submit" loading={isSaving} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </Col>

        <Col xs={24} xl={9}>
          <Card title="Receipt preview" className="xl:sticky xl:top-0">
            <ReceiptHeaderPreview values={values} logoUrl={storeSettings?.logoUrl} />
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default StoreDetailsForm;
