// baseRoute must match <BrowserRouter basename> in main.tsx and `base` in vite.config.ts.
export const CONSTANT_ROUTES = {
  // App Routes
  baseRoute: "/",
  login: "/login",
  // Module Routes
  home: "/",
  register: "/register",
  products: "/products",
  sales: "/sales",
  closeDay: "/close-day",
  storeDetails: "/settings/store",
  branding: "/settings/branding",
  staff: "/settings/staff",
} as const;
