import { Alert, Button, Typography } from "antd";
import { PrintIcon, VoidIcon } from "../../assets/icons/Icons";
import { PaymentMethodEnum, SaleStatusEnum } from "../../enums/sale.enum";
import { useReceiptHook } from "../../hooks/register/receipt.hook";
import { peso } from "../../utils/sale.util";
import SaleReceipt from "./SaleReceipt";

const { Text } = Typography;

interface IProps {
  // Opens the void form in place of the receipt.
  onVoid: () => void;
}

// Shown in the modal after a sale: the change to give, the receipt, and print. A mistake
// can be voided from here straight away, with a manager's approval for a cashier.
const SaleReceiptPanel = ({ onVoid }: IProps) => {
  const { receiptRef, lastSale, settings, print, isPrinting, printerName, startNextOrder } = useReceiptHook();
  if (!lastSale) return null;
  const isVoid = lastSale.status === SaleStatusEnum.voided;
  const isCash = lastSale.payment.method === PaymentMethodEnum.cash;

  return (
    <div className="flex flex-col gap-4">
      {isVoid && lastSale.voidInfo ? (
        <Alert
          type="error"
          showIcon
          title="This sale is void"
          description={`Approved by ${lastSale.voidInfo.approvedByName}. Reason: ${lastSale.voidInfo.reason}`}
        />
      ) : (
        isCash && (
          <div className="amgc-change is-ok">
            <span>{lastSale.payment.change > 0 ? "Give change" : "Exact amount received"}</span>
            <strong className="tabular-nums">{peso(lastSale.payment.change)}</strong>
          </div>
        )
      )}
      <div className="amgc-receipt-stage">
        <SaleReceipt ref={receiptRef} sale={lastSale} settings={settings} />
      </div>
      {/* The next order is what the cashier usually wants, so it leads, full width. */}
      <Button type="primary" size="large" block onClick={startNextOrder}>
        Start next order <kbd className="amgc-kbd amgc-kbd--on-primary !ml-1">Enter</kbd>
      </Button>
      <div className="flex gap-2">
        <Button size="large" className="flex-1" icon={<PrintIcon size={18} />} loading={isPrinting} onClick={() => print()}>
          Print receipt
        </Button>
        {!isVoid && (
          <Button size="large" danger icon={<VoidIcon size={18} />} onClick={onVoid}>
            Void
          </Button>
        )}
      </div>
      <Text className="!text-xs !text-[var(--amgc-text-muted)]">
        {printerName
          ? `Print sends the receipt to ${printerName}.`
          : "Print sends the receipt to this device's printer. Choose the receipt printer the first time."}
      </Text>
    </div>
  );
};

export default SaleReceiptPanel;
