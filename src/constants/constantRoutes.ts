// baseRoute must match <BrowserRouter basename> in main.tsx and `base` in vite.config.ts.
export const CONSTANT_ROUTES = {
  // App Routes
  baseRoute: "/",
  login: "/login",
  // Module Routes
  home: "/",
  storeDetails: "/settings/store",
  branding: "/settings/branding",
} as const;
