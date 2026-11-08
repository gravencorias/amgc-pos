import { Button } from "antd";
import { BackspaceIcon } from "../../assets/icons/Icons";

interface IProps {
  // A digit, "00", or "back".
  onKey: (key: string) => void;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// The on-screen number pad for cash received, in touch mode. Laid out like the sign-in PinPad,
// with 00 for round amounts. It keeps the tablet's own keyboard from covering the Charge dialog.
const CashPad = ({ onKey }: IProps) => (
  <div className="amgc-cash-pad" role="group" aria-label="Number pad for cash received">
    {DIGITS.map((digit) => (
      <Button key={digit} onClick={() => onKey(digit)}>
        {digit}
      </Button>
    ))}
    <Button className="amgc-cash-pad__quiet" onClick={() => onKey("00")}>
      00
    </Button>
    <Button onClick={() => onKey("0")}>0</Button>
    <Button
      className="amgc-cash-pad__quiet"
      type="text"
      aria-label="Delete last digit"
      icon={<BackspaceIcon size={22} />}
      onClick={() => onKey("back")}
    />
  </div>
);

export default CashPad;
