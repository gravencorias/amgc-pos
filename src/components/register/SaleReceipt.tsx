import type { Ref } from "react";
import { RECEIPT_DISCLAIMER } from "../../constants/constantReceipt";
import {
  discountKindLabel,
  discountKindShort,
  orderTypeLabel,
  PaymentMethodEnum,
  paymentMethodLabel,
  SaleStatusEnum,
} from "../../enums/sale.enum";
import type { ISaleResponse } from "../../models/sale/sale.response.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { peso } from "../../utils/sale.util";
import { receiptWidthClass } from "../../utils/receipt.util";

interface IProps {
  sale: ISaleResponse;
  settings: IStoreSettingsResponse | undefined;
  // What react-to-print prints (React 19 passes ref as a plain prop).
  ref?: Ref<HTMLDivElement>;
}

const money = (value: number) => value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The thermal receipt, printed from the server's figures. Shares .amgc-receipt styles
// with the Store details preview, so what owners preview is what prints.
const SaleReceipt = ({ sale, settings, ref }: IProps) => {
  const t = sale.totals;
  const when = new Date(sale.createdAt);
  const voidInfo = sale.status === SaleStatusEnum.voided ? sale.voidInfo : null;
  const voidedAt = voidInfo ? new Date(voidInfo.voidedAt) : null;

  return (
    <div className={`amgc-receipt${receiptWidthClass(settings?.receiptWidth)}${voidInfo ? " is-void" : ""}`} ref={ref}>
      {settings?.showLogoOnReceipt && settings.logoUrl && <img className="amgc-receipt__logo" src={settings.logoUrl} alt="" />}
      <p className="amgc-receipt__center amgc-receipt__store">{settings?.storeName ?? "Store"}</p>
      {settings?.tagline && <p className="amgc-receipt__center">{settings.tagline}</p>}
      {settings?.address && <p className="amgc-receipt__center">{settings.address}</p>}
      {settings?.tin && (
        <p className="amgc-receipt__center">
          {settings.vatRegistered ? "VAT Reg." : "Non-VAT Reg."} TIN {settings.tin}
        </p>
      )}
      <hr />
      {voidInfo && <p className="amgc-receipt__center amgc-receipt__void">*** VOID ***</p>}
      <p className="amgc-receipt__row">
        <span>Receipt no.</span>
        <span>{sale.receiptNumber}</span>
      </p>
      <p className="amgc-receipt__row">
        <span>Order {sale.orderNumber}</span>
        <span>
          {orderTypeLabel[sale.orderType]}
          {sale.tableNo ? `, table ${sale.tableNo}` : ""}
        </span>
      </p>
      <p className="amgc-receipt__row">
        <span>{when.toLocaleDateString("en-PH")}</span>
        <span>{when.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</span>
      </p>
      <p className="amgc-receipt__row">
        <span>Cashier</span>
        <span>{sale.cashierName}</span>
      </p>
      <hr />
      {sale.lines.map((l, i) => (
        <div key={i}>
          <p className="amgc-receipt__row">
            <span>
              {l.qty} x {l.name}
            </span>
            <span>{money(l.lineTotal)}</span>
          </p>
          {(l.sizeName || l.addOns.length > 0 || l.note) && (
            <p className="amgc-receipt__sub">
              {[l.sizeName, ...l.addOns.map((a) => a.name), l.note ? `"${l.note}"` : null].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      ))}
      <hr />
      <p className="amgc-receipt__row">
        <span>Subtotal</span>
        <span>{money(t.gross)}</span>
      </p>
      {sale.discount && (
        <>
          {t.vatExemptAmount > 0 && (
            <p className="amgc-receipt__row">
              <span>Less VAT 12%</span>
              <span>-{money(t.vatExemptAmount)}</span>
            </p>
          )}
          <p className="amgc-receipt__row">
            <span>Less {discountKindShort[sale.discount.kind]} disc. 20%</span>
            <span>-{money(t.discountAmount)}</span>
          </p>
        </>
      )}
      <p className="amgc-receipt__row amgc-receipt__total">
        <span>TOTAL</span>
        <span>{peso(t.total)}</span>
      </p>
      <p className="amgc-receipt__row">
        <span>{paymentMethodLabel[sale.payment.method]}</span>
        <span>{money(sale.payment.tendered)}</span>
      </p>
      {sale.payment.method === PaymentMethodEnum.cash && (
        <p className="amgc-receipt__row">
          <span>Change</span>
          <span>{money(sale.payment.change)}</span>
        </p>
      )}
      {sale.payment.reference && (
        <p className="amgc-receipt__row">
          <span>Ref. no.</span>
          <span>{sale.payment.reference}</span>
        </p>
      )}
      {settings?.vatRegistered !== false && (
        <>
          <hr />
          <p className="amgc-receipt__row">
            <span>VATable sales</span>
            <span>{money(t.vatableSales)}</span>
          </p>
          <p className="amgc-receipt__row">
            <span>VAT-exempt sales</span>
            <span>{money(t.vatExemptSales)}</span>
          </p>
          <p className="amgc-receipt__row">
            <span>VAT 12%</span>
            <span>{money(t.vat)}</span>
          </p>
        </>
      )}
      {sale.discount && (
        <>
          <hr />
          <p>
            {discountKindLabel[sale.discount.kind]}: {sale.discount.name}
          </p>
          <p>ID no.: {sale.discount.idNumber}</p>
          <p>Signature: ________________</p>
        </>
      )}
      {voidInfo && voidedAt && (
        <>
          <hr />
          <p className="amgc-receipt__center amgc-receipt__void">VOIDED. NOT A SALE.</p>
          <p className="amgc-receipt__row">
            <span>Voided</span>
            <span>
              {voidedAt.toLocaleDateString("en-PH")} {voidedAt.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
            </span>
          </p>
          <p className="amgc-receipt__row">
            <span>By</span>
            <span>{voidInfo.voidedByName}</span>
          </p>
          {voidInfo.approvedByName !== voidInfo.voidedByName && (
            <p className="amgc-receipt__row">
              <span>Approved by</span>
              <span>{voidInfo.approvedByName}</span>
            </p>
          )}
          <p>Reason: {voidInfo.reason}</p>
        </>
      )}
      <hr />
      {settings?.receiptFooter && <p className="amgc-receipt__center">{settings.receiptFooter}</p>}
      <p className="amgc-receipt__center amgc-receipt__note">{RECEIPT_DISCLAIMER}</p>
    </div>
  );
};

export default SaleReceipt;
