import { Typography } from "antd";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

const { Title, Text } = Typography;

interface IPageHeaderProps {
  icon: IconType;
  title: string;
  description?: ReactNode;
  extra?: ReactNode;
}

const PageHeader = ({ icon: Icon, title, description, extra }: IPageHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--amgc-primary)_12%,transparent)] text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <Title className="!mb-0 !text-[28px]">{title}</Title>
      </div>
      {description && <Text className="mt-2 block max-w-[70ch] !text-[var(--amgc-text-muted)]">{description}</Text>}
    </div>
    {extra}
  </div>
);

export default PageHeader;
