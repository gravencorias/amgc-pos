import type { ComponentType } from "react";
import type { UserRoleEnum } from "../../enums/user-role.enum";
import type { RouteObject } from "react-router-dom";

export type IRoute = {
  key: string;
  path?: string;
  name?: string;
  icon?: any;
  color?: string;
  hidden?: boolean;
  role?: UserRoleEnum[];
  children?: IRoute[];
  component?: ComponentType | undefined;
} & RouteObject;
