// One person who can sign in to the register. Passwords and PINs never come back from the API.
export interface IStaffResponse {
  id: number;
  fullName: string;
  username: string | null;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  hasPin: boolean;
  createdAt: string;
  lastSignInAt: string | null;
}
