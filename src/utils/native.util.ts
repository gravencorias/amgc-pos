import { Capacitor } from "@capacitor/core";

// True inside the Android app (Capacitor), false in a browser, PC or tablet alike.
export const isNativeApp = Capacitor.isNativePlatform();

// This build's version. build-package.ps1 sets VITE_APP_VERSION to the package's version, so the
// Android app and the store's server can tell when they differ; yarn dev and plain builds are "dev".
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || "dev";
