import { Alert, Button } from "antd";
import { PrintIcon, VoidIcon } from "../../assets/icons/Icons";
import { SaleStatusEnum } from "../../enums/sale.enum";
import { useSaleReceiptHook } from "../../hooks/sales/sale-receipt.hook";
import { formatTime } from "../../utils/date.util";
import SaleReceipt from "../register/SaleReceipt";

interface IProps {
  // Opens the void form in place of the receipt.
  onVoid: () => void;
}

// A past receipt from the Sales list: the same layout the register printed, with reprint,
// and a void for a sale that's still completed.
const SaleReceiptView = ({ onVoid }: IProps) => {
  const { receiptRef, sale, settings, print, handleClose } = useSaleReceiptHook();
  if (!sale) return null;
  const isVoid = sale.status === SaleStatusEnum.voided;

  return (
    <div className="flex flex-col gap-4">
      {isVoid && sale.voidInfo && (
        <Alert
          type="error"
          showIcon
          title={`Voided at ${formatTime(sale.voidInfo.voidedAt)} by ${sale.voidInfo.voidedByName}`}
          description={`Reason: ${sale.voidInfo.reason}`}
        />
      )}
      <div className="amgc-receipt-stage">
        <SaleReceipt ref={receiptRef} sale={sale} settings={settings} />
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <Button size="large" onClick={handleClose}>
          Close
        </Button>
        <div className="flex flex-wrap gap-2">
          {!isVoid && (
            <Button size="large" danger icon={<VoidIcon size={18} />} onClick={onVoid}>
              Void sale
            </Button>
          )}
          <Button type="primary" size="large" icon={<PrintIcon size={18} />} onClick={() => print()}>
            Reprint
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaleReceiptView;
