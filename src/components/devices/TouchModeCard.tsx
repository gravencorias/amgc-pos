import { Card, Segmented, Tag } from "antd";
import { TouchModeEnum, touchModeLabel } from "../../enums/device.enum";

interface IProps {
  touchMode: TouchModeEnum;
  isTouch: boolean;
  hasTouchscreen: boolean;
  onChange: (touchMode: TouchModeEnum) => void;
}

const TouchModeCard = ({ touchMode, isTouch, hasTouchscreen, onChange }: IProps) => {
  return (
    <Card title="This device">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">Touch mode</span>
          <Tag color={isTouch ? "green" : "default"} className="!m-0">
            {isTouch ? "On" : "Off"}
          </Tag>
        </div>

        <Segmented<TouchModeEnum>
          block
          value={touchMode}
          onChange={onChange}
          options={Object.values(TouchModeEnum).map((value) => ({ value, label: touchModeLabel[value] }))}
        />

        <p className="amgc-devices__note">
          {touchMode === TouchModeEnum.auto
            ? hasTouchscreen
              ? "This device is used by touch, so touch mode is on."
              : "This device is used with a mouse, so touch mode is off."
            : "Saved on this device only. Other registers keep their own setting."}
        </p>

        <div>
          <div className="amgc-devices__label">In touch mode</div>
          <ul className="amgc-devices__list">
            <li>Buttons, rows and choices are bigger.</li>
            <li>Taking cash shows a number pad, so the keyboard doesn't cover the screen.</li>
            <li>The cash count has − and + for each bill and coin.</li>
            <li>Keyboard shortcut hints are hidden, and the search box doesn't open the keyboard by itself.</li>
            <li>Rows in Products and Staff get a ⋯ button for their menu.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default TouchModeCard;
