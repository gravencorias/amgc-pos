export interface IUserAccountResponse {
  id: number;
  userInfo: IUserInfoResponse;
  tokenInfo: ITokenInfo;
}

export interface IUserInfoResponse {
  id: number;
  username: string | null;
  fullName: string;
  roleName: string;
}

export interface ITokenInfo {
  token: string;
  refreshToken: string;
  expiration: number;
  roles: IRole[];
}

// The account's role code (UserRoleEnum: P001, P002 or P003). Routes and permission checks gate on it.
export interface IRole {
  access: string;
}
