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
      <div className="dcwd-loader__ripples" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <svg className="dcwd-loader__drop" viewBox="0 0 120 160" role="img" aria-label="Loading">
        <defs>
          <clipPath id="dcwd-drop-clip">
            <path d="M60 4 C60 4 112 74 112 104 A52 52 0 1 1 8 104 C8 74 60 4 60 4 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#dcwd-drop-clip)">
          <rect className="dcwd-loader__water" x="-10" y="60" width="140" height="140" />
          <path
            className="dcwd-loader__wave dcwd-loader__wave--back"
            d="M-40 70 C -10 55, 20 85, 50 70 S 110 55, 140 70 S 200 85, 230 70 V 200 H -40 Z"
          />
          <path
            className="dcwd-loader__wave dcwd-loader__wave--front"
            d="M-40 78 C -10 63, 20 93, 50 78 S 110 63, 140 78 S 200 93, 230 78 V 200 H -40 Z"
          />
        </g>
        <path className="dcwd-loader__outline" d="M60 4 C60 4 112 74 112 104 A52 52 0 1 1 8 104 C8 74 60 4 60 4 Z" />
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
