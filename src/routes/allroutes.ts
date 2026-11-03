import { BrandingIcon, HomeIcon, SettingsIcon } from "../assets/icons/Icons";
import { CONSTANT_ROUTES } from "../constants/constantRoutes";
import type { IRoute } from "../models/common/route.model";
import Login from "../pages/auth/Login";
import Home from "../pages/home/Home";
import Branding from "../pages/store-settings/Branding";
import StoreDetails from "../pages/store-settings/StoreDetails";
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
    ],
  },
];
