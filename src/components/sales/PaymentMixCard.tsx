import { Card, Progress, Typography } from "antd";
import { CardIcon, CashIcon, EwalletIcon } from "../../assets/icons/Icons";
import { PaymentMethodEnum, paymentMethodLabel } from "../../enums/sale.enum";
import type { ISaleSummaryResponse } from "../../models/sale/sale.response.model";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

const ICONS = {
  [PaymentMethodEnum.cash]: CashIcon,
  [PaymentMethodEnum.ewallet]: EwalletIcon,
  [PaymentMethodEnum.card]: CardIcon,
};

interface IProps {
  byPayment: ISaleSummaryResponse["byPayment"];
  grossSales: number;
}

// How the day was paid. Cash is what should be in the drawer at closing.
const PaymentMixCard = ({ byPayment, grossSales }: IProps) => (
  <Card title="How customers paid">
    <ul className="flex list-none flex-col gap-4 p-0">
      {byPayment.map((p) => {
        const Icon = ICONS[p.method];
        return (
          <li key={p.method} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--amgc-bg-subtle)]">
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <Text strong>{paymentMethodLabel[p.method]}</Text>
                <Text strong className="tabular-nums">
                  {peso(p.total)}
                </Text>
              </div>
              <Progress
                percent={grossSales ? Math.round((p.total / grossSales) * 100) : 0}
                size="small"
                showInfo={false}
                aria-label={`${paymentMethodLabel[p.method]} share`}
              />
              <Text className="!text-xs !text-[var(--amgc-text-muted)]">
                {p.count} sale{p.count === 1 ? "" : "s"}
              </Text>
            </div>
          </li>
        );
      })}
    </ul>
  </Card>
);

export default PaymentMixCard;
