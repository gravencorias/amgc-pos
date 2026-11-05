import { Tooltip } from "antd";
import { CollapseIcon } from "../../assets/icons/Icons";

interface IProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// A round button on the side menu's right edge, level with the store mark. Its arrow
// points the way the menu will move, so it flips when the menu is folded.
const SiderToggle = ({ isCollapsed, onToggle }: IProps) => {
  const label = isCollapsed ? "Expand menu" : "Collapse menu";

  return (
    <Tooltip title={label} placement="right">
      <button
        type="button"
        className={`amgc-sider-toggle${isCollapsed ? " is-collapsed" : ""}`}
        aria-label={label}
        aria-expanded={!isCollapsed}
        onClick={onToggle}
      >
        <CollapseIcon size={16} strokeWidth={2.5} />
      </button>
    </Tooltip>
  );
};

export default SiderToggle;
