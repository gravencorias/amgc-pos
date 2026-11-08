import axios from "axios";

// THE STORE'S SERVER, in the Android app. A browser register opens the app from the server
// itself, so VITE_API_URL ("/api/") is right. The APK carries its own copy of the app, so it
// saves the server's address once (the Connect screen) and points axios at it at startup.
// http_service.ts stays verbatim: it sets axios.defaults.baseURL when it loads, and
// applySavedServer() in main.tsx runs after it.
export const SERVER_URL_KEY = "amgc_server_url";
export const DEFAULT_SERVER_PORT = 5000;

export const readSavedServer = (): string | null => {
  try {
    return window.localStorage.getItem(SERVER_URL_KEY);
  } catch {
    return null;
  }
};

export const apiBaseFor = (serverUrl: string) => `${serverUrl}/api/`;

export const applyServerUrl = (serverUrl: string) => {
  axios.defaults.baseURL = apiBaseFor(serverUrl);
};

export const applySavedServer = () => {
  const saved = readSavedServer();
  if (saved) applyServerUrl(saved);
};

// What people type or scan, as "http://host:port": "192.168.1.10", "192.168.1.10:5000" and the
// QR code's "http://192.168.1.10:5000/" all work. Only the address matters; any path is dropped.
// null when it isn't an address.
export const normalizeServerAddress = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname) return null;
    const port = url.port || (url.protocol === "http:" ? String(DEFAULT_SERVER_PORT) : "");
    return `${url.protocol}//${url.hostname}${port ? `:${port}` : ""}`;
  } catch {
    return null;
  }
};
