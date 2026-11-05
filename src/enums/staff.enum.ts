// Values are what amgc-pos-api accepts in the staff list's `status` filter.
export enum StaffStatusEnum {
  active = "active",
  inactive = "inactive",
  all = "all",
}

export const staffStatusLabel: Record<StaffStatusEnum, string> = {
  [StaffStatusEnum.active]: "Active",
  [StaffStatusEnum.inactive]: "Turned off",
  [StaffStatusEnum.all]: "Everyone",
};

export type StaffCredentialKind = "pin" | "password";
