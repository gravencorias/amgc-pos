import { Alert, Button } from "antd";
import { PrintIcon, ReopenIcon } from "../../assets/icons/Icons";
import { formatTime } from "../../utils/date.util";
import { useZReadingHook } from "../../hooks/close-day/z-reading.hook";
import ZReading from "./ZReading";

interface IProps {
  // Set only for the owner, on the latest closing still in force.
  onReopen?: () => void;
}

// A Z reading in the modal, with print, and Reopen when it's allowed.
const ZReadingView = ({ onReopen }: IProps) => {
  const { zReadingRef, dayClose, settings, print, isPrinting, handleClose } = useZReadingHook();
  if (!dayClose) return null;

  return (
    <div className="flex flex-col gap-4">
      {dayClose.reopenInfo && (
        <Alert
          type="warning"
          showIcon
          title={`Reopened at ${formatTime(dayClose.reopenInfo.reopenedAt)} by ${dayClose.reopenInfo.reopenedByName}`}
          description={`Reason: ${dayClose.reopenInfo.reason}. This Z reading no longer closes the day.`}
        />
      )}
      <div className="amgc-receipt-stage">
        <ZReading ref={zReadingRef} dayClose={dayClose} settings={settings} />
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <Button size="large" onClick={handleClose}>
          Close
        </Button>
        <div className="flex flex-wrap gap-2">
          {onReopen && (
            <Button size="large" danger icon={<ReopenIcon size={18} />} onClick={onReopen}>
              Reopen
            </Button>
          )}
          <Button type="primary" size="large" icon={<PrintIcon size={18} />} loading={isPrinting} onClick={() => print()}>
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ZReadingView;
