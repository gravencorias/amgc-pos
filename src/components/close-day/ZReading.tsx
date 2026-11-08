import type { Ref } from "react";
import { RECEIPT_DISCLAIMER } from "../../constants/constantReceipt";
import { denominationLabel } from "../../constants/constantCash";
import { paymentMethodLabel } from "../../enums/sale.enum";
import type { IDayCloseResponse } from "../../models/day-close/day-close.response.model";
import type { IStoreSettingsResponse } from "../../models/store-settings/store-settings.response.model";
import { receiptWidthClass } from "../../utils/receipt.util";

interface IProps {
  dayClose: IDayCloseResponse;
  settings: IStoreSettingsResponse | undefined;
  // What react-to-print prints (React 19 passes ref as a plain prop).
  ref?: Ref<HTMLDivElement>;
}

const money = (value: number) => value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Row = ({ label, value }: { label: string; value: string }) => (
  <p className="amgc-receipt__row">
    <span>{label}</span>
    <span>{value}</span>
  </p>
);

// The end-of-day Z reading on the receipt printer, in the sale receipt's styles.
const ZReading = ({ dayClose: z, settings, ref }: IProps) => {
  const f = z.figures;
  const closedAt = new Date(z.closedAt);
  const day = new Date(`${z.date}T00:00:00`);

  return (
    <div className={`amgc-receipt${receiptWidthClass(settings?.receiptWidth)}`} ref={ref}>
      <p className="amgc-receipt__center amgc-receipt__store">{settings?.storeName ?? "Store"}</p>
      {settings?.address && <p className="amgc-receipt__center">{settings.address}</p>}
      {settings?.tin && (
        <p className="amgc-receipt__center">
          {settings.vatRegistered ? "VAT Reg." : "Non-VAT Reg."} TIN {settings.tin}
        </p>
      )}
      <hr />
      <p className="amgc-receipt__center amgc-receipt__void">Z READING</p>
      {z.reopenInfo && <p className="amgc-receipt__center amgc-receipt__void">*** REOPENED ***</p>}
      <Row label="Z no." value={z.zNumber} />
      <Row label="Business day" value={day.toLocaleDateString("en-PH")} />
      <Row
        label="Closed"
        value={`${closedAt.toLocaleDateString("en-PH")} ${closedAt.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`}
      />
      <Row label="Closed by" value={z.closedByName} />
      <Row label="Receipts" value={f.firstReceipt ? `${f.firstReceipt}-${f.lastReceipt}` : "None"} />
      <hr />
      <Row label="Sales" value={String(f.saleCount)} />
      <Row label="Gross sales" value={money(f.grossSales)} />
      <Row label={`Less SC/PWD (${f.discountCount})`} value={`-${money(f.discountTotal)}`} />
      <p className="amgc-receipt__row amgc-receipt__total">
        <span>NET SALES</span>
        <span>{money(f.netSales)}</span>
      </p>
      {settings?.vatRegistered !== false && (
        <>
          <hr />
          <Row label="VATable sales" value={money(f.vatableSales)} />
          <Row label="VAT 12%" value={money(f.vat)} />
          <Row label="VAT-exempt sales" value={money(f.vatExemptSales)} />
        </>
      )}
      <hr />
      <Row label={`Voided (${f.voidCount})`} value={money(f.voidTotal)} />
      {f.byPayment.map((p) => (
        <Row key={p.method} label={`${paymentMethodLabel[p.method]} (${p.count})`} value={money(p.total)} />
      ))}
      <hr />
      <p className="amgc-receipt__center">CASH COUNT</p>
      {z.cashCount.map((c) => (
        <Row key={c.denomination} label={`${denominationLabel(c.denomination)} x ${c.qty}`} value={money(c.denomination * c.qty)} />
      ))}
      <Row label="Starting cash" value={money(z.openingFloat)} />
      <Row label="Cash sales" value={money(f.cashSales)} />
      <Row label="Expected" value={money(z.expectedCash)} />
      <Row label="Counted" value={money(z.countedCash)} />
      <p className="amgc-receipt__row amgc-receipt__total">
        <span>{z.overShort === 0 ? "BALANCED" : z.overShort > 0 ? "OVER" : "SHORT"}</span>
        <span>{money(Math.abs(z.overShort))}</span>
      </p>
      {z.note && <p>Note: {z.note}</p>}
      <hr />
      <Row label="Old grand total" value={money(z.grandTotalBefore)} />
      <Row label="New grand total" value={money(z.grandTotalAfter)} />
      {z.reopenInfo && (
        <>
          <hr />
          <p className="amgc-receipt__center amgc-receipt__void">REOPENED. NOT IN FORCE.</p>
          <Row
            label="Reopened"
            value={`${new Date(z.reopenInfo.reopenedAt).toLocaleDateString("en-PH")} ${new Date(z.reopenInfo.reopenedAt).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`}
          />
          <Row label="By" value={z.reopenInfo.reopenedByName} />
          <p>Reason: {z.reopenInfo.reason}</p>
        </>
      )}
      <hr />
      <p className="amgc-receipt__center amgc-receipt__note">{RECEIPT_DISCLAIMER}</p>
    </div>
  );
};

export default ZReading;
