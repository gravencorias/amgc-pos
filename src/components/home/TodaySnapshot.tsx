import { Button, Card, Skeleton, Typography } from "antd";
import type { ISaleSummaryResponse } from "../../models/sale/sale.response.model";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

interface IProps {
  summary: ISaleSummaryResponse | undefined;
  isLoading: boolean;
  onOpenSales: () => void;
}

// Owners and managers see how the day is going without opening the report.
const TodaySnapshot = ({ summary, isLoading, onOpenSales }: IProps) => (
  <Card title="Today so far" extra={<Button onClick={onOpenSales}>Open Sales</Button>}>
    {isLoading || !summary ? (
      <Skeleton active paragraph={{ rows: 3 }} />
    ) : summary.saleCount ? (
      <div className="flex flex-col gap-4">
        <div>
          <Text className="block !text-[var(--amgc-text-muted)]">Gross sales</Text>
          <Text className="!text-[32px] font-extrabold tabular-nums">{peso(summary.grossSales)}</Text>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Text className="block !text-xs !text-[var(--amgc-text-muted)]">Sales</Text>
            <Text strong className="tabular-nums">
              {summary.saleCount}
            </Text>
          </div>
          <div>
            <Text className="block !text-xs !text-[var(--amgc-text-muted)]">Average sale</Text>
            <Text strong className="tabular-nums">
              {peso(summary.averageSale)}
            </Text>
          </div>
        </div>
        {summary.topProducts[0] && (
          <Text className="!text-sm !text-[var(--amgc-text-muted)]">
            Top seller: <Text strong>{summary.topProducts[0].name}</Text>, {summary.topProducts[0].qty} sold
          </Text>
        )}
      </div>
    ) : (
      <Text className="!text-[var(--amgc-text-muted)]">No sales yet today. They show here as soon as the register rings one up.</Text>
    )}
  </Card>
);

export default TodaySnapshot;
