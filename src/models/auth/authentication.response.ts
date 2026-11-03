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
  accessLevels: AccessLevel[];
}

export interface IRole {
  access: string;
}

export interface AccessLevel {
  code: string;
  value: string;
}
