import type { IStoreDetailsFormValues } from "../../models/store-settings/store-settings.request.model";
import { receiptWidthClass } from "../../utils/receipt.util";

interface IProps {
  values: Partial<IStoreDetailsFormValues> | undefined;
  logoUrl: string | null | undefined;
}

// How the top and bottom of a receipt will print with the details being edited.
const ReceiptHeaderPreview = ({ values, logoUrl }: IProps) => (
  <div className="amgc-receipt-stage">
    <div className={`amgc-receipt${receiptWidthClass(values?.receiptWidth)}`} aria-label="Receipt preview">
      {values?.showLogoOnReceipt && logoUrl && <img className="amgc-receipt__logo" src={logoUrl} alt="" />}
      <p className="amgc-receipt__center amgc-receipt__store">{values?.storeName || "Store name"}</p>
      {values?.tagline && <p className="amgc-receipt__center">{values.tagline}</p>}
      {values?.address && <p className="amgc-receipt__center">{values.address}</p>}
      {values?.tin && (
        <p className="amgc-receipt__center">
          {values.vatRegistered ? "VAT Reg." : "Non-VAT Reg."} TIN {values.tin}
        </p>
      )}
      <hr />
      <p className="amgc-receipt__row">
        <span>1 x Spanish Latte</span>
        <span>165.00</span>
      </p>
      <p className="amgc-receipt__row">
        <span>2 x Ensaymada</span>
        <span>170.00</span>
      </p>
      <hr />
      <p className="amgc-receipt__row amgc-receipt__total">
        <span>TOTAL</span>
        <span>₱335.00</span>
      </p>
      {values?.vatRegistered ? (
        <>
          <p className="amgc-receipt__row">
            <span>VATable sales</span>
            <span>299.11</span>
          </p>
          <p className="amgc-receipt__row">
            <span>VAT 12%</span>
            <span>35.89</span>
          </p>
        </>
      ) : (
        <p className="amgc-receipt__row">
          <span>VAT-exempt sales</span>
          <span>335.00</span>
        </p>
      )}
      <hr />
      {values?.receiptFooter && <p className="amgc-receipt__center">{values.receiptFooter}</p>}
    </div>
  </div>
);

export default ReceiptHeaderPreview;
