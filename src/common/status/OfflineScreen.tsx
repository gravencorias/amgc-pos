import { Button } from "antd";
import { OfflineIcon, RetryIcon } from "../../assets/icons/Icons";
import { useConnectionHook } from "../../hooks/connection/connection.hook";
import type { OfflineReason } from "../../stores/common/connection.store";
import { formatTime } from "../../utils/date.util";

const MESSAGES: Record<OfflineReason, { chip: string; title: string; text: string }> = {
  network: {
    chip: "No connection",
    title: "This device is offline",
    text: "Check the Wi-Fi or the network cable. The order on screen is kept, but nothing can be charged until the connection is back.",
  },
  server: {
    chip: "Server unreachable",
    title: "Can't reach the store's server",
    text: "The network works, but the store's main PC isn't answering. Check that it's on and connected, then try again. The order on screen is kept.",
  },
  502: {
    chip: "Server error",
    title: "The store's server has a problem",
    text: "It answered, but something behind it failed. Try again in a moment. The order on screen is kept.",
  },
  503: {
    chip: "Server busy",
    title: "The store's server isn't ready",
    text: "It may be starting up or updating. Try again in a moment. The order on screen is kept.",
  },
};

// THE OFFLINE SCREEN. Over the whole app while this device is offline, the store's server
// stops answering, or it answers that it's down (502/503); http_service.ts records each in
// stores/common/connection.store.ts. It COVERS the app rather than replacing it, so whatever
// was open (a half-built order, a form) stays and is uncovered when the connection is back.
// It also clears by itself: it checks every 20 seconds and when the device reports it's online.
const OfflineScreen = () => {
  const { isOffline, reason, lastConnectedAt, isChecking, retry } = useConnectionHook();
  if (!isOffline || reason === null) return null;

  const message = MESSAGES[reason];

  return (
    <div className="amgc-offline" role="alertdialog" aria-modal="true" aria-labelledby="amgc-offline-title">
      <div className="amgc-offline__card">
        <span className="amgc-offline__icon" aria-hidden="true">
          <OfflineIcon size={34} />
        </span>
        <span className="amgc-offline__chip">{message.chip}</span>
        <h1 id="amgc-offline-title" className="amgc-offline__title">
          {message.title}
        </h1>
        <p className="amgc-offline__text">{message.text}</p>
        <Button
          type="primary"
          size="large"
          block
          icon={<RetryIcon size={18} />}
          loading={isChecking}
          onClick={() => void retry()}
        >
          {isChecking ? "Checking…" : "Try again"}
        </Button>
        {lastConnectedAt && (
          <p className="amgc-offline__meta">Last connected at {formatTime(new Date(lastConnectedAt).toISOString())}</p>
        )}
      </div>
    </div>
  );
};

export default OfflineScreen;
