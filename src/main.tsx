import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/inter";
import "./assets/scss/index.scss";
import { BrowserRouter } from "react-router-dom";
import { CONSTANT_ROUTES } from "./constants/constantRoutes";
import { applySavedServer } from "./utils/server.util";
import { isNativeApp } from "./utils/native.util";

// The Android app calls the store server it saved, not /api/ (see utils/server.util.ts). After the
// imports above, so it overrides the baseURL http_service.ts set when it loaded.
if (isNativeApp) applySavedServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={CONSTANT_ROUTES.baseRoute}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
