import type { UserRoleEnum } from "../enums/user-role.enum";
import type { AccessLevel } from "../models/auth/authentication.response";
import { CONSTANT_ROLES } from "../roles/contants.roles";

// Owners and managers run the store's settings; cashiers only sell.
export const checkIfManager = (accessRights: AccessLevel[] | undefined) => {
  const managerAccess = [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager];

  return !!accessRights?.some((access) => managerAccess.includes(access.code as UserRoleEnum));
};
