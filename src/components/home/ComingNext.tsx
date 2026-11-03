import { Card, Tag, Typography } from "antd";
import type { IconType } from "react-icons";
import { ProductsIcon, ReceiptIcon, SalesIcon } from "../../assets/icons/Icons";

const { Text } = Typography;

const NEXT: { icon: IconType; title: string; description: string }[] = [
  { icon: ProductsIcon, title: "Products and categories", description: "The menu, with photos, sizes and add-ons." },
  { icon: ReceiptIcon, title: "Register", description: "Keyboard checkout, discounts, payment and receipts." },
  { icon: SalesIcon, title: "Sales", description: "Daily totals, sales by hour and top sellers." },
];

// Honest status of the modules that are still being built.
const ComingNext = () => (
  <Card title="Coming next">
    <ul className="flex list-none flex-col gap-5 p-0">
      {NEXT.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--amgc-bg-subtle)] text-[var(--amgc-text-muted)]">
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <Text strong className="block">
              {title}
            </Text>
            <Text className="block !text-sm !text-[var(--amgc-text-muted)]">{description}</Text>
          </div>
          <Tag className="!m-0">In development</Tag>
        </li>
      ))}
    </ul>
  </Card>
);

export default ComingNext;
