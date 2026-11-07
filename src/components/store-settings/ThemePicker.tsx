import type { CSSProperties } from "react";
import { CONSTANT_THEME_PRESETS, CUSTOM_THEME_TINT, DEFAULT_CUSTOM_COLOR } from "../../constants/constantThemes";
import { CornerStyleEnum, StoreThemeEnum, TextSizeEnum, ThemeModeEnum } from "../../enums/branding.enum";
import { resolveBranding } from "../../utils/helpers";

interface IProps {
  value?: StoreThemeEnum;
  onChange?: (value: StoreThemeEnum) => void;
  customColor?: string | null;
  mode?: ThemeModeEnum;
}

const OPTIONS = [
  ...CONSTANT_THEME_PRESETS.map((p) => ({ id: p.id, name: p.name, note: p.note, tint: p.tint })),
  { id: StoreThemeEnum.custom, name: "Custom", note: "The store's own color", tint: CUSTOM_THEME_TINT },
];

// A tiny register in each theme, in the light or dark mode being previewed (as the prototype's swatches).
const miniStyle = (theme: StoreThemeEnum, tint: number, customColor: string, mode: ThemeModeEnum) => {
  const { isDark, accent, hue } = resolveBranding({
    theme,
    customColor,
    mode,
    corners: CornerStyleEnum.soft,
    textSize: TextSizeEnum.normal,
  });

  return {
    "--mini-bg": `hsl(${hue} ${tint}% ${isDark ? 7 : 92}%)`,
    "--mini-frame": `hsl(${hue} ${tint}% ${isDark ? 10 : 96.5}%)`,
    "--mini-panel": `hsl(${hue} ${tint * 0.5}% ${isDark ? 13 : 99.5}%)`,
    "--mini-tile": `hsl(${hue} ${isDark ? 22 : 34}% ${isDark ? 24 : 85}%)`,
    "--mini-line": `hsl(${hue} ${tint * 0.7}% ${isDark ? 22 : 85}%)`,
    "--mini-accent": accent,
  } as CSSProperties;
};

// Controlled by Form.Item (value/onChange), like a plain antd input.
const ThemePicker = ({ value, onChange, customColor, mode = ThemeModeEnum.light }: IProps) => (
  <div className="amgc-theme-picker" role="radiogroup" aria-label="Theme">
    {OPTIONS.map((o) => (
      <button
        key={o.id}
        type="button"
        role="radio"
        aria-checked={value === o.id}
        className={`amgc-theme-picker__option ${value === o.id ? "is-selected" : ""}`}
        onClick={() => onChange?.(o.id)}
      >
        <span className="amgc-theme-mini" style={miniStyle(o.id, o.tint, customColor || DEFAULT_CUSTOM_COLOR, mode)} aria-hidden="true">
          <span className="amgc-theme-mini__rail" />
          <span className="amgc-theme-mini__tiles">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="amgc-theme-mini__ticket">
            <i />
            <i />
            <i />
            <b />
          </span>
        </span>
        <span className="amgc-theme-picker__name">{o.name}</span>
        <span className="amgc-theme-picker__note">{o.note}</span>
      </button>
    ))}
  </div>
);

export default ThemePicker;
