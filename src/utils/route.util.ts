import type { UserRoleEnum } from "../enums/user-role.enum";
import type { IRoute } from "../models/common/route.model";

const isChildRoute = (
  route: IRoute,
): route is IRoute & { children: IRoute[] } => {
  return Array.isArray(route.children);
};

export const filterRoutesByRole = (
  routes: IRoute[],
  userRoles: UserRoleEnum[],
): IRoute[] => {
  return routes
    .filter((route) => {
      if (!route.role) return true;
      return route.role.some((role) => userRoles.includes(role));
    })
    .map((route) => {
      if (isChildRoute(route)) {
        const filteredChildren = filterRoutesByRole(route.children, userRoles);
        return {
          ...route,
          children: filteredChildren,
        };
      }

      return { ...route };
    })
    .filter((route) => {
      if (isChildRoute(route)) return route.children.length > 0;
      return (route.name && route.icon) || route.path;
    });
};

export const filterOutHiddenMenuRoutes = (routes: IRoute[]): IRoute[] => {
  return routes.filter((route) => !route.hidden);
};

export const flattenRoutes = (routes: IRoute[]): IRoute[] => {
  return routes.flatMap((route) =>
    isChildRoute(route) ? [route, ...flattenRoutes(route.children)] : [route],
  );
};
