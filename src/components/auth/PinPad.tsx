import { Button, Typography } from "antd";
import { BackspaceIcon } from "../../assets/icons/Icons";

const { Text } = Typography;

interface IProps {
  pin: string;
  maxLength: number;
  rejected: boolean;
  canSubmit: boolean;
  isLoading: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const PinPad = ({ pin, maxLength, rejected, canSubmit, isLoading, onDigit, onBackspace, onClear, onSubmit }: IProps) => (
  <div className="amgc-pin">
    <div className={`amgc-pin__dots ${rejected ? "is-rejected" : ""}`} role="status" aria-label={`${pin.length} digits entered`}>
      {Array.from({ length: maxLength }, (_, i) => (
        <span key={i} className={i < pin.length ? "is-filled" : ""} />
      ))}
    </div>

    <div className="amgc-pin__keys">
      {KEYS.map((key) => (
        <Button key={key} size="large" className="amgc-pin__key" onClick={() => onDigit(key)}>
          {key}
        </Button>
      ))}
      <Button size="large" type="text" className="amgc-pin__key amgc-pin__key--quiet" onClick={onClear}>
        Clear
      </Button>
      <Button size="large" className="amgc-pin__key" onClick={() => onDigit("0")}>
        0
      </Button>
      <Button
        size="large"
        type="text"
        className="amgc-pin__key amgc-pin__key--quiet"
        aria-label="Delete last digit"
        icon={<BackspaceIcon size={22} />}
        onClick={onBackspace}
      />
    </div>

    <Button type="primary" size="large" block disabled={!canSubmit} loading={isLoading} onClick={onSubmit}>
      Start shift
    </Button>
    <Text className="block text-center !text-[var(--amgc-text-muted)] !text-xs">
      Type your PIN on the keyboard and press Enter, or tap the numbers.
    </Text>
  </div>
);

export default PinPad;
