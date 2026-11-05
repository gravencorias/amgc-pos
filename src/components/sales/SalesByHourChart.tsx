import { Card, Empty, Tooltip } from "antd";
import type { ISaleSummaryResponse } from "../../models/sale/sale.response.model";
import { hourLabel } from "../../utils/date.util";
import { peso } from "../../utils/sale.util";
import { pesoAmount } from "../../utils/helpers";

interface IProps {
  byHour: ISaleSummaryResponse["byHour"];
}

// Bars drawn to one scale: each bar's height is its share of the busiest hour.
// Shows store hours (7 AM to 9 PM), stretched if a sale fell outside them.
const SalesByHourChart = ({ byHour }: IProps) => {
  const withSales = byHour.filter((h) => h.count > 0);
  const first = Math.min(7, ...withSales.map((h) => h.hour));
  const last = Math.max(21, ...withSales.map((h) => h.hour));
  const hours = byHour.filter((h) => h.hour >= first && h.hour <= last);
  const max = Math.max(1, ...hours.map((h) => h.total));
  const peak = withSales.length ? hours.reduce((a, b) => (b.total > a.total ? b : a)) : null;

  return (
    <Card title="Sales by hour" extra={peak ? `Busiest: ${hourLabel(peak.hour)}` : undefined}>
      {withSales.length ? (
        <div
          role="img"
          aria-label={`Sales by hour. Busiest hour ${peak ? `${hourLabel(peak.hour)}, ${peso(peak.total)}` : "none"}.`}
        >
          <div className="amgc-bars">
            {hours.map((h) => (
              <Tooltip key={h.hour} title={`${hourLabel(h.hour)}: ${peso(h.total)}, ${h.count} sale${h.count === 1 ? "" : "s"}`}>
                <div className="amgc-bars__col">
                  {peak?.hour === h.hour && <span className="amgc-bars__value">{pesoAmount(Math.round(h.total))}</span>}
                  <span
                    className={`amgc-bars__bar ${h.count ? "" : "is-empty"} ${peak?.hour === h.hour ? "is-peak" : ""}`}
                    style={{ height: `${(h.total / max) * 100}%` }}
                  />
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="amgc-bars__axis" aria-hidden="true">
            {hours.map((h) => (
              <span key={h.hour}>{(h.hour - first) % 3 === 0 ? hourLabel(h.hour) : ""}</span>
            ))}
          </div>
        </div>
      ) : (
        <Empty description="No sales on this day." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default SalesByHourChart;
