import type { CSSProperties } from "react";
import type { IBrandingFormValues } from "../../models/store-settings/store-settings.request.model";
import { getInitials, resolveBranding } from "../../utils/helpers";

interface IProps {
  branding: IBrandingFormValues;
  storeName: string;
  logoUrl: string | null | undefined;
}

const TILES = [
  { name: "Spanish Latte", price: "₱165", hue: 38 },
  { name: "Ube Latte", price: "₱175", hue: 275 },
  { name: "Matcha Latte", price: "₱170", hue: 95 },
  { name: "Ensaymada", price: "₱85", hue: 46 },
  { name: "Tapsilog", price: "₱220", hue: 10 },
  { name: "Leche Flan", price: "₱95", hue: 42 },
];

// A small register drawn with the branding being edited, before it's saved.
const BrandingPreview = ({ branding, storeName, logoUrl }: IProps) => {
  const { isDark, accent, ink, hue, radius, fontSize } = resolveBranding(branding);
  const style = {
    "--pv-accent": accent,
    "--pv-ink": ink,
    "--pv-hue": hue,
    "--pv-radius": `${radius}px`,
    "--pv-scale": fontSize / 14,
  } as CSSProperties;

  return (
    <div className={`amgc-preview ${isDark ? "is-dark" : ""}`} style={style} aria-label="Register preview">
      <div className="amgc-preview__rail">
        <span className="amgc-preview__mark">{logoUrl ? <img src={logoUrl} alt="" /> : getInitials(storeName)}</span>
        <i className="is-on" />
        <i />
        <i />
      </div>
      <div className="amgc-preview__main">
        <div className="amgc-preview__top">
          <b>{storeName}</b>
          <span>Search products</span>
        </div>
        <div className="amgc-preview__grid">
          {TILES.map((t) => (
            <div key={t.name} className="amgc-preview__tile">
              <span style={{ "--th": t.hue } as CSSProperties} />
              <b>{t.name}</b>
              <small>{t.price}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="amgc-preview__ticket">
        <b>Order 0061</b>
        <p>
          <span>Spanish Latte</span>
          <span>165.00</span>
        </p>
        <p>
          <span>2 × Ensaymada</span>
          <span>170.00</span>
        </p>
        <div className="amgc-preview__charge">
          <span>Charge</span>
          <b>₱335.00</b>
        </div>
      </div>
    </div>
  );
};

export default BrandingPreview;
