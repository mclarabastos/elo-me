export const USER_ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  CLINIC: "clinic",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
