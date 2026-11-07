import { Button, Card, Col, ColorPicker, Form, Row, Segmented, Typography, type FormInstance } from "antd";
import type { Color } from "antd/es/color-picker";
import {
  CornerStyleEnum,
  StoreThemeEnum,
  TextSizeEnum,
  ThemeModeEnum,
  cornerStyleLabel,
  textSizeLabel,
  themeModeLabel,
} from "../../enums/branding.enum";
import type { IBrandingFormValues } from "../../models/store-settings/store-settings.request.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import BrandingPreview from "./BrandingPreview";
import LogoUploader from "./LogoUploader";
import ThemePicker from "./ThemePicker";

const { Text } = Typography;

interface IProps {
  form: FormInstance<IBrandingFormValues>;
  storeSettings?: IStoreSettingsResponse;
  preview?: IBrandingFormValues;
  isDirty: boolean;
  isSaving: boolean;
  onFinish: (values: IBrandingFormValues) => void;
  onReset: () => void;
  logo: {
    beforeUpload: (file: File) => boolean;
    removeLogo: () => void;
    isUploading: boolean;
    isRemoving: boolean;
  };
}

const options = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));

const BrandingForm = ({ form, storeSettings, preview, isDirty, isSaving, onFinish, onReset, logo }: IProps) => {
  const theme = Form.useWatch("theme", form);
  const customColor = Form.useWatch("customColor", form);
  const mode = Form.useWatch("mode", form);
  const storeName = storeSettings?.storeName ?? "Your store";

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14} className="flex flex-col gap-6">
          <Card title="Logo">
            <LogoUploader
              logoUrl={storeSettings?.logoUrl}
              storeName={storeName}
              isUploading={logo.isUploading}
              isRemoving={logo.isRemoving}
              beforeUpload={logo.beforeUpload}
              onRemove={logo.removeLogo}
            />
          </Card>

          <Card title="Theme">
            <Form.Item name="theme" className="!mb-0">
              <ThemePicker customColor={customColor} mode={mode} />
            </Form.Item>
            {theme === StoreThemeEnum.custom && (
              <Form.Item
                label="Brand color"
                name="customColor"
                className="!mb-0 !mt-5"
                getValueFromEvent={(color: Color) => color.toHexString().toUpperCase()}
                extra="Text on buttons switches between dark and light by itself so it stays readable."
              >
                <ColorPicker disabledAlpha showText size="large" />
              </Form.Item>
            )}
          </Card>

          <Card title="Appearance">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Text strong>Light or dark</Text>
                <Form.Item name="mode" noStyle>
                  <Segmented<ThemeModeEnum> options={options(themeModeLabel)} />
                </Form.Item>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Text strong>Corners</Text>
                <Form.Item name="corners" noStyle>
                  <Segmented<CornerStyleEnum> options={options(cornerStyleLabel)} />
                </Form.Item>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Text strong className="block">
                    Text size
                  </Text>
                  <Text className="!text-sm !text-[var(--amgc-text-muted)]">Large is easier to read at a busy counter.</Text>
                </div>
                <Form.Item name="textSize" noStyle>
                  <Segmented<TextSizeEnum> options={options(textSizeLabel)} />
                </Form.Item>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button size="large" disabled={!isDirty || isSaving} onClick={onReset}>
              Undo changes
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={isSaving} disabled={!isDirty}>
              Save branding
            </Button>
          </div>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title="Preview"
            extra={isDirty ? <Text className="!text-[var(--amgc-text-muted)]">Not saved yet</Text> : null}
            className="xl:sticky xl:top-0"
          >
            {preview && <BrandingPreview branding={preview} storeName={storeName} logoUrl={storeSettings?.logoUrl} />}
            <Text className="mt-4 block !text-sm !text-[var(--amgc-text-muted)]">
              After you save, this computer switches right away. Other cashier computers switch the next time they load.
            </Text>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default BrandingForm;
