import type { CapacitorConfig } from "@capacitor/cli";

// The Android app (tablets). The screens are bundled in the APK (webDir), so every update
// means a new APK: build it with yarn build, then npx cap sync android, then Gradle (or
// amgc-pos-api/deploy/build-package.ps1, which does all three).
const config: CapacitorConfig = {
  // Android's package name. Never change it: tablets would treat a new one as a different app.
  appId: "com.amgc.pos",
  appName: "AMGC POS",
  webDir: "build",
  server: {
    // The app's own pages load from http://localhost, not https: the store's server is plain
    // http on the LAN, and an https page may not call an http API (mixed content).
    androidScheme: "http",
  },
  android: {
    // Release builds are signed in android/app/build.gradle from android/keystore.properties.
    webContentsDebuggingEnabled: false,
  },
};

export default config;
