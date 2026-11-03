import type { CSSProperties } from "react";
import { CONSTANT_THEME_PRESETS } from "../../constants/constantThemes";
import { StoreThemeEnum } from "../../enums/branding.enum";

interface IProps {
  value?: StoreThemeEnum;
  onChange?: (value: StoreThemeEnum) => void;
  customColor?: string | null;
}

// Controlled by Form.Item (value/onChange), like a plain antd input.
const ThemePicker = ({ value, onChange, customColor }: IProps) => {
  const options = [
    ...CONSTANT_THEME_PRESETS.map((p) => ({ id: p.id, name: p.name, note: p.note, light: p.light, dark: p.dark })),
    {
      id: StoreThemeEnum.custom,
      name: "Custom",
      note: "The store's own color",
      light: customColor ?? "#888888",
      dark: customColor ?? "#888888",
    },
  ];

  return (
    <div className="amgc-theme-picker" role="radiogroup" aria-label="Theme">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`amgc-theme-picker__option ${value === o.id ? "is-selected" : ""}`}
          onClick={() => onChange?.(o.id)}
        >
          <span className="amgc-theme-picker__swatch" style={{ "--sw-light": o.light, "--sw-dark": o.dark } as CSSProperties}>
            <i />
            <i />
          </span>
          <span className="amgc-theme-picker__name">{o.name}</span>
          <span className="amgc-theme-picker__note">{o.note}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemePicker;
