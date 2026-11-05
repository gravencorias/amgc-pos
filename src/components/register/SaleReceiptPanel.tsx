import { Button, Typography } from "antd";
import { PrintIcon } from "../../assets/icons/Icons";
import { PaymentMethodEnum } from "../../enums/sale.enum";
import { useReceiptHook } from "../../hooks/register/receipt.hook";
import { peso } from "../../utils/sale.util";
import SaleReceipt from "./SaleReceipt";

const { Text } = Typography;

// Shown in the modal after a sale: the change to give, the receipt, and print.
const SaleReceiptPanel = () => {
  const { receiptRef, lastSale, settings, print, startNextOrder } = useReceiptHook();
  if (!lastSale) return null;
  const isCash = lastSale.payment.method === PaymentMethodEnum.cash;

  return (
    <div className="flex flex-col gap-4">
      {isCash && (
        <div className="amgc-change is-ok">
          <span>{lastSale.payment.change > 0 ? "Give change" : "Exact amount received"}</span>
          <strong className="tabular-nums">{peso(lastSale.payment.change)}</strong>
        </div>
      )}
      <div className="amgc-receipt-stage">
        <SaleReceipt ref={receiptRef} sale={lastSale} settings={settings} />
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <Button size="large" icon={<PrintIcon size={18} />} onClick={() => print()}>
          Print receipt
        </Button>
        <Button type="primary" size="large" onClick={startNextOrder}>
          Start next order <kbd className="amgc-kbd amgc-kbd--on-primary !ml-1">Enter</kbd>
        </Button>
      </div>
      <Text className="!text-xs !text-[var(--amgc-text-muted)]">
        Print sends the receipt to the computer's printer. Choose the receipt printer the first time.
      </Text>
    </div>
  );
};

export default SaleReceiptPanel;
