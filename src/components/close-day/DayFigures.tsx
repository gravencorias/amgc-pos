import { Card, Typography } from "antd";
import { paymentMethodLabel } from "../../enums/sale.enum";
import type { IDayFigures } from "../../models/day-close/day-close.response.model";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

interface IProps {
  figures: IDayFigures;
  vatRegistered: boolean;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The day's totals, in the order the Z reading prints them: sales, then VAT, then voids
// and how customers paid.
const DayFigures = ({ figures: f, vatRegistered }: IProps) => (
  <Card
    title="The day's figures"
    extra={
      <Text className="!text-sm !text-[var(--amgc-text-muted)] tabular-nums">
        {f.firstReceipt ? `Receipts ${f.firstReceipt} to ${f.lastReceipt}` : "No receipts yet"}
      </Text>
    }
  >
    <dl className="amgc-figures">
      <dt>Sales</dt>
      <dd>{plural(f.saleCount, "sale")}</dd>
      <dt>Gross sales</dt>
      <dd>{peso(f.grossSales)}</dd>
      <dt>Less senior and PWD discounts ({f.discountCount})</dt>
      <dd className="is-less">-{peso(f.discountTotal)}</dd>
      <dt className="is-total">Net sales</dt>
      <dd className="is-total">{peso(f.netSales)}</dd>

      {vatRegistered && (
        <>
          <dt className="is-break">VATable sales</dt>
          <dd className="is-break">{peso(f.vatableSales)}</dd>
          <dt>VAT 12%</dt>
          <dd>{peso(f.vat)}</dd>
          <dt>VAT-exempt sales</dt>
          <dd>{peso(f.vatExemptSales)}</dd>
        </>
      )}

      <dt className="is-break">Voided ({f.voidCount})</dt>
      <dd className="is-break">{peso(f.voidTotal)}</dd>
      {f.byPayment.map((p) => (
        <div key={p.method} className="contents">
          <dt>
            {paymentMethodLabel[p.method]} ({p.count})
          </dt>
          <dd>{peso(p.total)}</dd>
        </div>
      ))}
    </dl>
  </Card>
);

export default DayFigures;
