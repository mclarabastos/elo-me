export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    me: "/auth/me",
  },
  patients: "/patients",
  doctors: "/doctors",
  clinics: "/clinics",
  medicalRecords: "/medical-records",
  permissions: "/permissions",
  chainlink: "/chainlink",
  ipfs: "/ipfs",
} as const;
