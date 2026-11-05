import { Badge, Typography } from "antd";

const { Text } = Typography;

interface IListSectionTitleProps {
  label: string;
  count: number;
}

// A list's label with its total, as in payroll's ListSectionTitle.
const ListSectionTitle = ({ label, count }: IListSectionTitleProps) => (
  <div className="flex items-center gap-2">
    <Text className="!text-[18px] font-semibold">{label}</Text>
    <Badge count={count.toLocaleString("en-PH")} showZero color="var(--amgc-primary)" overflowCount={Infinity} />
  </div>
);

export default ListSectionTitle;
