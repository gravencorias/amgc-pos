import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource-variable/inter";
import "./assets/scss/index.scss";
import { BrowserRouter } from "react-router-dom";
import { CONSTANT_ROUTES } from "./constants/constantRoutes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={CONSTANT_ROUTES.baseRoute}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
