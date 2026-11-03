import type { IPasswordLoginRequest, IPinLoginRequest } from "../../models/auth/authentication.request";
import type { IUserAccountResponse } from "../../models/auth/authentication.response";
import requests from "../../utils/http_service";

const accountRoute = "account";
const authRoute = "auth";

const AuthenticationService = {
  getMe: (): Promise<IUserAccountResponse> => requests.get(`${accountRoute}/me`),
  login: (request: IPasswordLoginRequest): Promise<IUserAccountResponse> => requests.post(`${authRoute}/login`, request),
  loginWithPin: (request: IPinLoginRequest): Promise<IUserAccountResponse> => requests.post(`${authRoute}/pin`, request),
};

export default AuthenticationService;
