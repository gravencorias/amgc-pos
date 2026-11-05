import { UserRoleEnum } from "../enums/user-role.enum";
import type { AccessLevel } from "../models/auth/authentication.response";
import { CONSTANT_ROLES } from "../roles/contants.roles";

// Owners and managers run the store's settings; cashiers only sell.
export const checkIfManager = (accessRights: AccessLevel[] | undefined) => {
  const managerAccess = [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager];

  return !!accessRights?.some((access) => managerAccess.includes(access.code as UserRoleEnum));
};

export const checkIfOwner = (accessRights: AccessLevel[] | undefined) =>
  !!accessRights?.some((access) => access.code === CONSTANT_ROLES.Owner);

// Who may edit, reset or turn off whose account: the owner manages everyone,
// a manager manages cashiers only. amgc-pos-api enforces the same rule.
export const canManageStaff = (accessRights: AccessLevel[] | undefined, targetRoleCode: string) =>
  checkIfOwner(accessRights) || (checkIfManager(accessRights) && targetRoleCode === UserRoleEnum.cashier);
