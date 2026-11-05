import { Button } from "antd";
import { PrintIcon } from "../../assets/icons/Icons";
import { useSaleReceiptHook } from "../../hooks/sales/sale-receipt.hook";
import SaleReceipt from "../register/SaleReceipt";

// A past receipt from the Sales list: the same layout the register printed, with reprint.
const SaleReceiptView = () => {
  const { receiptRef, sale, settings, print, handleClose } = useSaleReceiptHook();
  if (!sale) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="amgc-receipt-stage">
        <SaleReceipt ref={receiptRef} sale={sale} settings={settings} />
      </div>
      <div className="flex justify-between gap-2">
        <Button size="large" onClick={handleClose}>
          Close
        </Button>
        <Button type="primary" size="large" icon={<PrintIcon size={18} />} onClick={() => print()}>
          Reprint
        </Button>
      </div>
    </div>
  );
};

export default SaleReceiptView;
