import { Skeleton } from "antd";
import { StoreIcon } from "../../assets/icons/Icons";
import PageHeader from "../../components/common/PageHeader";
import StoreDetailsForm from "../../components/store-settings/StoreDetailsForm";
import { useStoreDetailsFormHook } from "../../hooks/store-settings/store-details.form.hook";

const StoreDetails = () => {
  const { form, storeSettings, isLoading, onFinish, isSaving } = useStoreDetailsFormHook();

  return (
    <div>
      <PageHeader
        icon={StoreIcon}
        title="Store details"
        description="What prints on every receipt. Every cashier computer in the store uses the same details."
      />
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <StoreDetailsForm form={form} storeSettings={storeSettings} isSaving={isSaving} onFinish={onFinish} />
      )}
    </div>
  );
};

export default StoreDetails;
