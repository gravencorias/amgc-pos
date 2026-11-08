// Role codes returned by amgc-pos-api in tokenInfo.roles[].access (also the JWT role claim).
export enum UserRoleEnum {
  owner = "P001",
  manager = "P002",
  cashier = "P003",
}

export const userRoleEnumValue: Record<string, UserRoleEnum> = {
  P001: UserRoleEnum.owner,
  P002: UserRoleEnum.manager,
  P003: UserRoleEnum.cashier,
};
