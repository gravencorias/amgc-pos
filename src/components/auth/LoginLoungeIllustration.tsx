import type { KeyboardEvent } from "react";

// A flat, faceless illustration for the sign-in screen: one person sunk into a bean bag,
// sipping a coffee under a floor lamp they can switch on and off. The bean bag and the
// mug's band take the store's brand color (--amgc-primary), so the scene fits every theme.
// Drawn in SVG so it ships with the app.
const SKIN = "#c68863";
const SKIN_SHADE = "#a86d4b";
const SHIRT = "#f4efe8";
const SHIRT_SHADE = "#ddd5ca";
const PANTS = "#2f2e41";
const PANTS_SHADE = "#45435a";
const BAG = "color-mix(in srgb, var(--amgc-primary) 60%, #000)";
const BAG_LIGHT = "color-mix(in srgb, var(--amgc-primary) 70%, #fff)";
const LAMP_METAL = "#2f2e41";
const WARM_LIGHT = "#ffe6a0";

type Props = {
  lampOn: boolean;
  onToggleLamp: () => void;
};

const LoginLoungeIllustration = ({ lampOn, onToggleLamp }: Props) => {
  const lampLabel = lampOn ? "Turn the lamp off" : "Turn the lamp on";

  // Enter and Space work the lamp. Stopping the event keeps Enter from also signing in.
  const onLampKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    onToggleLamp();
  };

  return (
    <div className={`amgc-login__art${lampOn ? "" : " is-lamp-off"}`}>
      <svg viewBox="0 0 420 420" role="group" aria-label="A cozy corner with a floor lamp">
        <defs>
          <filter id="amgc-lounge-shadow" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <radialGradient id="amgc-lounge-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={WARM_LIGHT} stopOpacity="0.55" />
            <stop offset="1" stopColor={WARM_LIGHT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="amgc-lounge-beam" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={WARM_LIGHT} stopOpacity="0.4" />
            <stop offset="1" stopColor={WARM_LIGHT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* A soft glow behind, and the rug */}
        <circle cx="210" cy="240" r="172" fill="#ffffff" opacity="0.08" />
        <ellipse cx="214" cy="374" rx="188" ry="16" fill="#ffffff" opacity="0.12" />

        {/* The lamp's warm light, which fades out when it's switched off */}
        <g className="amgc-lounge__light">
          <circle cx="172" cy="112" r="150" fill="url(#amgc-lounge-glow)" />
          <path d="M152 100 L194 100 L300 340 L60 340 Z" fill="url(#amgc-lounge-beam)" />
        </g>

        {/* The lamp's pole, which disappears behind the bean bag */}
        <path
          d="M112 380 L112 120 C112 88 140 70 172 74"
          stroke={LAMP_METAL}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Potted plant */}
        <g fill="#ffffff" opacity="0.55">
          <path d="M62 336 C52 312 40 300 32 280 C52 286 64 304 62 336 Z" />
          <path d="M62 336 C60 304 66 278 80 258 C86 282 76 308 62 336 Z" />
          <path d="M62 336 C70 314 84 302 100 296 C96 316 82 328 62 336 Z" />
        </g>
        <path d="M44 334 L80 334 L75 372 L49 372 Z" fill={SHIRT} />

        {/* Bean bag */}
        <ellipse cx="205" cy="376" rx="148" ry="11" fill="#000" opacity="0.22" filter="url(#amgc-lounge-shadow)" />
        <path
          d="M92 362 C74 318 92 252 140 226 C172 210 208 222 222 250 C238 274 296 284 318 318 C336 348 318 374 268 376 L138 376 C112 376 98 372 92 362 Z"
          style={{ fill: BAG }}
        />
        <path
          d="M110 316 C108 278 124 250 150 236"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
          style={{ stroke: BAG_LIGHT }}
        />
        <path d="M138 376 C150 344 196 322 250 318" stroke="#000" strokeWidth="2" fill="none" opacity="0.15" />

        {/* Legs, then the hips */}
        <path d="M220 300 L300 290 L342 354" stroke={PANTS_SHADE} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <ellipse cx="352" cy="363" rx="16" ry="8" fill="#ffffff" />
        <path d="M224 292 L290 272 L318 350" stroke={PANTS} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <ellipse cx="328" cy="360" rx="17" ry="8" fill="#ffffff" />
        <ellipse cx="222" cy="294" rx="27" ry="15" fill={PANTS} />

        {/* Back arm, behind the body, also holding the mug */}
        <path d="M182 222 L206 262 L214 212" stroke={SHIRT_SHADE} strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M206 262 L214 212" stroke={SKIN_SHADE} strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Neck, torso, head and hair */}
        <rect x="185" y="182" width="14" height="22" rx="6" fill={SKIN_SHADE} />
        <path d="M168 214 C175 200 200 196 212 206 C226 220 238 255 244 286 L196 298 C186 270 172 240 168 214 Z" fill={SHIRT} />
        <circle cx="192" cy="170" r="19" fill={SKIN} />
        <path
          d="M173 172 C170 150 190 142 205 150 C211 154 212 160 209 163 C198 158 188 162 186 172 C185 180 180 188 175 186 Z"
          fill={PANTS}
        />
        <circle cx="175" cy="148" r="9" fill={PANTS} />

        {/* The mug, tipped toward her, with the store's color around it */}
        <g transform="rotate(-14 226 196)">
          <path d="M237 189 C247 189 247 205 237 205" stroke="#ffffff" strokeWidth="4" fill="none" />
          <rect x="215" y="184" width="22" height="24" rx="4" fill="#ffffff" />
          <rect x="215" y="194" width="22" height="6" style={{ fill: "var(--amgc-primary)" }} />
        </g>

        {/* Front arm and hand */}
        <path d="M206 214 L232 252" stroke={SHIRT} strokeWidth="17" strokeLinecap="round" fill="none" />
        <path d="M232 252 L221 208" stroke={SKIN} strokeWidth="11" strokeLinecap="round" fill="none" />
        <circle cx="220" cy="203" r="6.5" fill={SKIN} />

        {/* Steam */}
        <g className="amgc-art-steam" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round">
          <path className="amgc-art-steam__wisp" d="M222 174 C215 163 229 156 222 143 C218 135 224 128 222 120" />
          <path className="amgc-art-steam__wisp" d="M233 172 C226 160 240 153 233 139 C229 131 235 124 233 116" />
          <path className="amgc-art-steam__wisp" d="M212 176 C206 167 218 160 212 149" />
        </g>

        {/* The lamp's shade, bulb and pull chain: the part that switches it */}
        <g
          className="amgc-lounge__lamp"
          role="button"
          tabIndex={0}
          aria-label={lampLabel}
          aria-pressed={lampOn}
          onClick={onToggleLamp}
          onKeyDown={onLampKeyDown}
        >
          <title>{lampLabel}</title>
          <rect x="136" y="60" width="72" height="72" fill="transparent" />
          <ellipse className="amgc-lounge__focus" cx="172" cy="96" rx="36" ry="32" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 5" fill="none" />
          <g className="amgc-lounge__chain">
            <path d="M188 102 L188 118" stroke={LAMP_METAL} strokeWidth="1.6" />
            <circle cx="188" cy="120" r="2.8" fill={LAMP_METAL} />
          </g>
          <ellipse cx="172" cy="102" rx="15" ry="4.5" fill={lampOn ? "#fff8e1" : "#8c877f"} />
          <path
            className="amgc-lounge__shade"
            d="M148 102 C148 84 158 74 172 74 C186 74 196 84 196 102 Z"
            fill={lampOn ? "#fff3d6" : SHIRT_SHADE}
          />
        </g>
      </svg>
    </div>
  );
};

export default LoginLoungeIllustration;
