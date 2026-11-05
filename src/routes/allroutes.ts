import { BrandingIcon, CloseDayIcon, HomeIcon, ProductsIcon, RegisterIcon, SalesIcon, SettingsIcon } from "../assets/icons/Icons";
import Sales from "../pages/sales/Sales";
import CloseDay from "../pages/close-day/CloseDay";
import Register from "../pages/register/Register";
import Products from "../pages/product/Products";
import { CONSTANT_ROUTES } from "../constants/constantRoutes";
import type { IRoute } from "../models/common/route.model";
import Login from "../pages/auth/Login";
import Home from "../pages/home/Home";
import Branding from "../pages/store-settings/Branding";
import StoreDetails from "../pages/store-settings/StoreDetails";
import Staff from "../pages/staff/Staff";
import { CONSTANT_ROLES } from "../roles/contants.roles";

export const PublicRoutes: IRoute[] = [
  {
    key: "login",
    path: CONSTANT_ROUTES.login,
    name: "Sign in",
    component: Login,
  },
];

export const ProtectedRoutes: IRoute[] = [
  {
    key: "home",
    path: CONSTANT_ROUTES.home,
    name: "Home",
    icon: HomeIcon,
    component: Home,
  },
  {
    // Everyone signed in sells, so no role list.
    key: "register",
    path: CONSTANT_ROUTES.register,
    name: "Register",
    icon: RegisterIcon,
    component: Register,
  },
  {
    key: "products",
    path: CONSTANT_ROUTES.products,
    name: "Products",
    icon: ProductsIcon,
    component: Products,
    role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
  },
  {
    key: "sales",
    path: CONSTANT_ROUTES.sales,
    name: "Sales",
    icon: SalesIcon,
    component: Sales,
    role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
  },
  {
    key: "close-day",
    path: CONSTANT_ROUTES.closeDay,
    name: "Close day",
    icon: CloseDayIcon,
    component: CloseDay,
    role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
  },
  {
    key: "settings",
    name: "Settings",
    icon: SettingsIcon,
    children: [
      {
        key: "store-details",
        path: CONSTANT_ROUTES.storeDetails,
        name: "Store details",
        component: StoreDetails,
        role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
      },
      {
        key: "branding",
        path: CONSTANT_ROUTES.branding,
        name: "Branding",
        icon: BrandingIcon,
        component: Branding,
        role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
      },
      {
        key: "staff",
        path: CONSTANT_ROUTES.staff,
        name: "Staff",
        component: Staff,
        role: [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager],
      },
    ],
  },
];
