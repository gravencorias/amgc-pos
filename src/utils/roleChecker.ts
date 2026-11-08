import { UserRoleEnum } from "../enums/user-role.enum";
import type { IRole } from "../models/auth/authentication.response";
import { CONSTANT_ROLES } from "../roles/contants.roles";

// Owners and managers run the store's settings; cashiers only sell.
export const checkIfManager = (roles: IRole[] | undefined) => {
  const managerRoles = [CONSTANT_ROLES.Owner, CONSTANT_ROLES.Manager];

  return !!roles?.some((role) => managerRoles.includes(role.access as UserRoleEnum));
};

export const checkIfOwner = (roles: IRole[] | undefined) =>
  !!roles?.some((role) => role.access === CONSTANT_ROLES.Owner);

// Who may edit, reset or turn off whose account: the owner manages everyone,
// a manager manages cashiers only. amgc-pos-api enforces the same rule.
export const canManageStaff = (roles: IRole[] | undefined, targetRoleCode: string) =>
  checkIfOwner(roles) || (checkIfManager(roles) && targetRoleCode === UserRoleEnum.cashier);
