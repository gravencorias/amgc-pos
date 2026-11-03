import { Button, Card, Progress, Typography } from "antd";
import { DoneIcon, TodoIcon } from "../../assets/icons/Icons";
import type { ISetupStep } from "../../hooks/home/home.hook";

const { Text } = Typography;

interface IProps {
  storeName: string;
  steps: ISetupStep[];
  doneCount: number;
  onOpen: (path: string) => void;
}

const SetupChecklist = ({ storeName, steps, doneCount, onOpen }: IProps) => {
  const allDone = doneCount === steps.length;

  return (
    <Card
      title={allDone ? `${storeName} is ready for receipts` : `Finish setting up ${storeName}`}
      extra={<Text className="!text-[var(--amgc-text-muted)]">{`${doneCount} of ${steps.length} done`}</Text>}
    >
      <Progress percent={Math.round((doneCount / Math.max(1, steps.length)) * 100)} showInfo={false} />
      <ul className="mt-4 flex list-none flex-col p-0">
        {steps.map((step) => (
          <li
            key={step.key}
            className="flex items-center gap-4 border-0 border-t border-solid border-[var(--amgc-border)] py-4 first:border-t-0"
          >
            <span className={step.done ? "text-primary" : "text-[var(--amgc-text-muted)]"}>
              {step.done ? <DoneIcon size={22} /> : <TodoIcon size={22} />}
            </span>
            <div className="min-w-0 flex-1">
              <Text strong className={`block ${step.done ? "!text-[var(--amgc-text-muted)]" : ""}`}>
                {step.title}
              </Text>
              <Text className="block !text-sm !text-[var(--amgc-text-muted)]">{step.description}</Text>
            </div>
            <Button onClick={() => onOpen(step.path)}>{step.done ? "Review" : "Add"}</Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default SetupChecklist;
