import { Col, Row } from "antd";
import { DevicesIcon } from "../../assets/icons/Icons";
import PageHeader from "../../components/common/PageHeader";
import ServerQrCard from "../../components/devices/ServerQrCard";
import TouchModeCard from "../../components/devices/TouchModeCard";
import AndroidAppCard from "../../components/devices/AndroidAppCard";
import ReceiptPrinterCard from "../../components/devices/ReceiptPrinterCard";
import { useDevicesHook } from "../../hooks/devices/devices.hook";

const Devices = () => {
  const devices = useDevicesHook();
  const { serverInfoQuery } = devices;

  return (
    <div>
      <PageHeader
        icon={DevicesIcon}
        title="Devices"
        description="Add tablets and other registers to the store, and set how this device works."
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={15} className="flex flex-col gap-6">
          <ServerQrCard
            addresses={devices.addresses}
            selected={devices.selected}
            isLoading={serverInfoQuery.isLoading}
            isFetching={serverInfoQuery.isFetching}
            onSelect={devices.setSelectedAddress}
            onRefresh={() => serverInfoQuery.refetch()}
          />
          {!serverInfoQuery.isLoading && <AndroidAppCard apkUrl={devices.apkUrl} version={devices.serverVersion} />}
        </Col>
        <Col xs={24} xl={9} className="flex flex-col gap-6">
          <TouchModeCard
            touchMode={devices.touchMode}
            isTouch={devices.isTouch}
            hasTouchscreen={devices.hasTouchscreen}
            onChange={devices.setTouchMode}
          />
          <ReceiptPrinterCard
            isNativeApp={devices.isNativeApp}
            devices={devices.devices}
            isLoadingDevices={devices.isLoadingDevices}
            printer={devices.printer}
            openDrawer={devices.openDrawer}
            isTesting={devices.isTesting}
            onSelect={devices.selectPrinter}
            onRefresh={devices.refreshDevices}
            onTest={devices.testPrint}
            onOpenDrawerChange={devices.setOpenDrawer}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Devices;
