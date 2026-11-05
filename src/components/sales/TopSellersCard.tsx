import { Card, Empty, Typography } from "antd";
import type { ISaleSummaryResponse } from "../../models/sale/sale.response.model";
import { peso } from "../../utils/sale.util";

const { Text } = Typography;

interface IProps {
  topProducts: ISaleSummaryResponse["topProducts"];
}

const TopSellersCard = ({ topProducts }: IProps) => {
  const most = Math.max(1, ...topProducts.map((p) => p.qty));

  return (
    <Card title="Top sellers">
      {topProducts.length ? (
        <ol className="amgc-top-list">
          {topProducts.map((p) => (
            <li key={p.name}>
              <div className="flex items-baseline justify-between gap-2">
                <Text strong className="truncate">
                  {p.name}
                </Text>
                <Text className="shrink-0 tabular-nums !text-[var(--amgc-text-muted)]">
                  {p.qty} sold, {peso(p.total)}
                </Text>
              </div>
              <span className="amgc-top-list__bar">
                <i style={{ width: `${(p.qty / most) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <Empty description="Top sellers appear after the first sale." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default TopSellersCard;
