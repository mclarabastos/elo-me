export const API_ENDPOINTS = {
  health: "/health",

  users: {
    demo: "/users/demo",
  },

  clinics: {
    demo: "/clinics/demo",
  },

  doctors: {
    demo: "/doctors/demo",
  },

  patients: {
    medicalData: (patientId: string) =>
      `/patients/${patientId}/medical-data`,

    accessRequests: (patientId: string) =>
      `/patients/${patientId}/access-requests`,
  },

  accessRequests: {
    root: "/access-requests",
    byId: (accessRequestId: string) =>
      `/access-requests/${accessRequestId}`,
    status: (accessRequestId: string) =>
      `/access-requests/${accessRequestId}/status`,
  },

  consents: {
    approve: "/consents/approve",
    revoke: "/consents/revoke",
    byId: (consentId: string) => `/consents/${consentId}`,
    verify: (consentId: string) => `/consents/${consentId}/verify`,
    authorizedMedicalData: (consentId: string) =>
      `/consents/${consentId}/authorized-medical-data`,
  },

  external: {
    verifyClinic: (clinicId: string) =>
      `/external/clinics/${clinicId}/verify`,

    verifyDoctor: (doctorId: string) =>
      `/external/doctors/${doctorId}/verify`,

    verifyConsent: (consentId: string) =>
      `/external/consents/${consentId}/verify`,

    validateAccess: "/external/access/validate",
  },
} as const;