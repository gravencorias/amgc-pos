import { Skeleton } from "antd";
import type { ISaleSummaryResponse } from "../../models/sale/sale.response.model";
import { peso } from "../../utils/sale.util";

interface IProps {
  summary: ISaleSummaryResponse | undefined;
  isLoading: boolean;
}

// The day's headline figures. These are what the page is for, so they lead.
const SalesStats = ({ summary, isLoading }: IProps) => {
  if (isLoading || !summary) return <Skeleton active paragraph={{ rows: 2 }} />;

  const stats = [
    { label: "Gross sales", value: peso(summary.grossSales), note: `After discounts. VAT ${peso(summary.vatTotal)}` },
    {
      label: "Sales",
      value: summary.saleCount.toLocaleString("en-PH"),
      note: `${summary.dineInCount} dine-in, ${summary.takeOutCount} take-out`,
    },
    { label: "Average sale", value: peso(summary.averageSale), note: `${summary.itemsSold} items sold` },
    {
      label: "Senior and PWD discounts",
      value: peso(summary.discountTotal),
      note: `${summary.discountCount} sale${summary.discountCount === 1 ? "" : "s"}, VAT removed included`,
    },
  ];

  return (
    <div className="amgc-stats">
      {stats.map((s) => (
        <div key={s.label} className="amgc-stat">
          <span className="amgc-stat__label">{s.label}</span>
          <strong className="amgc-stat__value">{s.value}</strong>
          <span className="amgc-stat__note">{s.note}</span>
        </div>
      ))}
    </div>
  );
};

export default SalesStats;
