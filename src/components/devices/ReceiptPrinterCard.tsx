import { Alert, Button, Card, Select, Switch } from "antd";
import { BluetoothIcon, PrintIcon, RetryIcon } from "../../assets/icons/Icons";
import type { IReceiptPrinter } from "../../stores/common/printer.store";
import type { IPairedDevice } from "../../utils/receipt-printer.util";

interface IProps {
  isNativeApp: boolean;
  devices: IPairedDevice[];
  isLoadingDevices: boolean;
  printer: IReceiptPrinter | null;
  openDrawer: boolean;
  isTesting: boolean;
  onSelect: (address: string | undefined) => void;
  onRefresh: () => void;
  onTest: () => void;
  onOpenDrawerChange: (openDrawer: boolean) => void;
}

// This tablet's Bluetooth receipt printer (Android app). A browser prints with its print dialog.
const ReceiptPrinterCard = ({
  isNativeApp,
  devices,
  isLoadingDevices,
  printer,
  openDrawer,
  isTesting,
  onSelect,
  onRefresh,
  onTest,
  onOpenDrawerChange,
}: IProps) => (
  <Card title="Receipt printer">
    {!isNativeApp ? (
      <p className="amgc-devices__note">
        Printing straight to a Bluetooth receipt printer works in the Android app. In a browser, Print opens the
        print dialog, which sends the receipt to this computer's printer.
      </p>
    ) : (
      <div className="flex flex-col gap-4">
        <div>
          <div className="amgc-devices__label">Bluetooth printer for this tablet</div>
          <div className="flex gap-2">
            <Select
              className="min-w-0 flex-1"
              placeholder="Choose a paired printer"
              allowClear
              loading={isLoadingDevices}
              value={printer?.address}
              onChange={onSelect}
              options={devices.map((d) => ({ value: d.address, label: d.name }))}
              notFoundContent="No paired devices. Pair the printer in Android's Bluetooth settings first."
            />
            <Button icon={<RetryIcon />} aria-label="Refresh the list" onClick={onRefresh} />
          </div>
        </div>

        <Alert
          type="info"
          showIcon
          icon={<BluetoothIcon />}
          title="Pair the printer first"
          description="Turn the printer on, then pair it in Android's Settings → Bluetooth (the PIN is often 0000 or 1234). It then shows in the list above."
        />

        <Button icon={<PrintIcon />} disabled={!printer} loading={isTesting} onClick={onTest}>
          Print a test page
        </Button>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Open the cash drawer on cash sales</div>
            <div className="amgc-devices__note">For a drawer plugged into the printer's drawer port.</div>
          </div>
          <Switch checked={openDrawer} disabled={!printer} onChange={onOpenDrawerChange} />
        </div>
      </div>
    )}
  </Card>
);

export default ReceiptPrinterCard;
