import { useEffect } from "react";
import { useLoadingScreenStore } from "../../stores/common/loading-screen.store";

interface IProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

const LOADING_MESSAGES = [
  "Checking who's on shift...",
  "Opening the register...",
  "Warming up the menu...",
  "Almost there...",
];

const MIN_VISIBLE_DURATION_MS = 1200;

const CUP_BODY = "M28 56 L132 56 L126 116 C124 130 112 138 96 138 L64 138 C48 138 36 130 34 116 Z";

// A surface wave 90 units long per ripple, wide enough to slide 90 units left and still
// cover the cup, so the drift loops without a seam.
const wavePath = (y: number) =>
  `M-40 ${y} Q-17.5 ${y - 7} 5 ${y} T50 ${y} T95 ${y} T140 ${y} T185 ${y} T230 ${y} T275 ${y} T320 ${y} V170 H-40 Z`;

const LoadingScreen = ({ children, className, visible }: IProps) => {
  const { showScreen, effectiveVisible, shownAt, setShownAt, setShowScreen, setEffectiveVisible } =
    useLoadingScreenStore();

  useEffect(() => {
    if (visible) {
      setShowScreen(true);
      setEffectiveVisible(true);
      setShownAt(Date.now());
      return;
    }

    const elapsed = shownAt ? Date.now() - shownAt : MIN_VISIBLE_DURATION_MS;
    const remaining = Math.max(MIN_VISIBLE_DURATION_MS - elapsed, 0);

    const timeoutId = window.setTimeout(() => {
      setEffectiveVisible(false);
    }, remaining);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!showScreen) return <>{children}</>;

  return (
    <div
      className={`dcwd-loader h-screen w-screen ${className ?? ""} ${effectiveVisible ? "" : "dcwd-loader--exiting"}`}
      onTransitionEnd={(event) => {
        if (event.propertyName === "opacity" && !effectiveVisible) setShowScreen(false);
      }}
    >
      {/* A cup that fills with coffee and drains again, with steam rising off it. */}
      <svg className="dcwd-loader__cup" viewBox="0 0 160 160" role="img" aria-label="Loading">
        <defs>
          <clipPath id="dcwd-cup-clip">
            <path d={CUP_BODY} />
          </clipPath>
        </defs>

        <g className="dcwd-loader__steam" aria-hidden="true">
          <path className="dcwd-loader__wisp" d="M62 40 C54 30 70 24 62 12" />
          <path className="dcwd-loader__wisp" d="M80 36 C72 24 88 18 80 4" />
          <path className="dcwd-loader__wisp" d="M98 40 C90 30 106 24 98 12" />
        </g>

        <path className="dcwd-loader__cup-inside" d={CUP_BODY} />
        <g clipPath="url(#dcwd-cup-clip)">
          <g className="dcwd-loader__fill">
            <path className="dcwd-loader__wave dcwd-loader__wave--crema" d={wavePath(56)} />
            <path className="dcwd-loader__wave dcwd-loader__wave--coffee" d={wavePath(62)} />
          </g>
        </g>
        <path className="dcwd-loader__handle" d="M128 70 C154 70 154 110 124 110" />
        <path className="dcwd-loader__outline" d={CUP_BODY} />
        <path className="dcwd-loader__saucer" d="M14 144 L146 144" />
        <path className="dcwd-loader__saucer dcwd-loader__saucer--base" d="M46 152 L114 152" />
      </svg>

      <p className="dcwd-loader__title">AMGC POS</p>
      <div className="dcwd-loader__messages" aria-live="polite">
        {LOADING_MESSAGES.map((message, index) => (
          <span key={message} className="dcwd-loader__message" style={{ animationDelay: `${index * 2.4}s` }}>
            {message}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
