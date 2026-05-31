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

  frontend: {
    patientDashboard: "/frontend/patient-dashboard",
    shareFlow: "/frontend/share-flow",
    auditTimeline: "/frontend/audit-timeline",
    creStatus: "/frontend/cre-status",
  },

  auth: {
    walletSession: "/auth/wallet-session",
    demoWalletPayloads: "/auth/demo-wallet-payloads",
    walletAbstractionConfig: "/auth/wallet-abstraction/config",
    walletAbstractionUxCopy: "/auth/wallet-abstraction/ux-copy",
  },

  integration: {
    status: "/integration/status",
    frontendContract: "/integration/frontend-contract",
    creContract: "/integration/cre-contract",
    pitchScriptData: "/integration/pitch-script-data",
    authContract: "/integration/auth-contract",
  },
} as const;