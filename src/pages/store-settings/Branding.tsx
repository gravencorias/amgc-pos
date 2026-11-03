import { Skeleton } from "antd";
import { BrandingIcon } from "../../assets/icons/Icons";
import PageHeader from "../../components/common/PageHeader";
import BrandingForm from "../../components/store-settings/BrandingForm";
import { useBrandingFormHook } from "../../hooks/store-settings/branding.form.hook";
import { useLogoHook } from "../../hooks/store-settings/logo.hook";

// Both mutation-owning hooks are called once here and their handlers passed down.
const Branding = () => {
  const { form, storeSettings, preview, isDirty, isLoading, onFinish, onReset, isSaving } = useBrandingFormHook();
  const logo = useLogoHook();

  return (
    <div>
      <PageHeader
        icon={BrandingIcon}
        title="Branding"
        description="How the register, the sign-in screen and receipts look. Every cashier computer in the store uses this."
      />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <BrandingForm
          form={form}
          storeSettings={storeSettings}
          preview={preview}
          isDirty={isDirty}
          isSaving={isSaving}
          onFinish={onFinish}
          onReset={onReset}
          logo={logo}
        />
      )}
    </div>
  );
};

export default Branding;
