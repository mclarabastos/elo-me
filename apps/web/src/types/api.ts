export type UserRole = "patient" | "doctor" | "clinic" | "admin" | string;

export type MedicalScope =
  | "identification"
  | "allergies"
  | "medications"
  | "recent_exams"
  | "special_needs"
  | "emergency_contact"
  | string;

export type ConsentStatus = "active" | "revoked" | "expired" | string;

export type AccessRequestStatus =
  | "pending"
  | "approved"
  | "denied"
  | "cancelled"
  | "rejected"
  | "revoked"
  | string;

export type RequesterType = "clinic" | "doctor" | string;

export type AccessDecision = "AUTHORIZED" | "DENIED" | "INFO" | string;

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
};

export type ClinicResponse = {
  id: string;
  name: string;
  cnpj: string | null;
  authorized: boolean;
  license_status: string;
  risk_level: string;
  created_at: string;
  updated_at: string;
};

export type DoctorResponse = {
  id: string;
  name: string;
  crm: string;
  authorized: boolean;
  crm_status: string;
  clinic_id: string;
  created_at: string;
  updated_at: string;
};

export type MedicalDataResponse = {
  id: string;
  patient_id: string;
  category: MedicalScope;
  label: string;
  data_hash: string;
  sensitivity: string;
  created_at: string;
  updated_at: string;
};

export type AccessRequestCreate = {
  patient_id: string;
  requester_type: RequesterType;
  clinic_id?: string | null;
  doctor_id?: string | null;
  requested_scopes: MedicalScope[];
  purpose: string;
  duration_hours: number;
};

export type AccessRequestStatusUpdate = {
  status: AccessRequestStatus;
};

export type AccessRequestResponse = {
  id: string;
  patient_id: string;
  requester_type: RequesterType;
  clinic_id: string | null;
  doctor_id: string | null;
  requested_scopes: MedicalScope[];
  purpose: string;
  duration_hours: number;
  status: AccessRequestStatus;
  created_at: string;
  updated_at: string;
};

export type AccessRequestsApiResponse =
  | AccessRequestResponse[]
  | {
      value: AccessRequestResponse[];
      Count?: number;
      count?: number;
    };

export type ConsentApproveRequest = {
  access_request_id: string;
  allowed_scopes: MedicalScope[];
  transaction_hash?: string | null;
};

export type ConsentRevokeRequest = {
  consent_id: string;
  transaction_hash?: string | null;
};

export type ConsentResponse = {
  id: string;
  access_request_id: string;
  patient_id: string;
  allowed_scopes: MedicalScope[];
  expires_at: string;
  status: ConsentStatus;
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsentVerifyResponse = {
  consentId: string;
  status: ConsentStatus;
  patientId: string;
  allowedScopes: MedicalScope[];
  expiresAt: string;
  isValid: boolean;
};

export type ExternalClinicVerifyResponse = {
  clinicId: string;
  name: string;
  authorized: boolean;
  licenseStatus: string;
  riskLevel: string;
};

export type ExternalDoctorVerifyResponse = {
  doctorId: string;
  name: string;
  authorized: boolean;
  crmStatus: string;
  clinicId: string;
};

export type ExternalConsentVerifyResponse = ConsentVerifyResponse;

export type AccessValidateParams = {
  clinic_id: string;
  doctor_id: string;
  consent_id: string;
  requested_scopes: MedicalScope[];
};

export type AccessValidateResponse = {
  decision: AccessDecision;
  reason: string;
  validatedBy: string;
  clinicAuthorized: boolean;
  doctorAuthorized: boolean;
  doctorBelongsToClinic: boolean;
  consentValid: boolean;
  scopeValid: boolean;
  requestedScopes: MedicalScope[];
  allowedScopes: MedicalScope[];
};

export type HealthResponse = {
  status: string;
  service: string;
};

export type FrontendAuditTimelineItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  actor: string;
  timestamp: string;
  type:
    | "identity"
    | "access_request"
    | "consent"
    | "cre_validation"
    | "audit_log"
    | string;
  decision: AccessDecision;
  statusLabel: string;
  clinicName: string;
  doctorName: string;
  requestedScopes: MedicalScope[];
  createdAt: string;
};

export type FrontendAuditTimelineResponse = {
  patientId: string;
  items: FrontendAuditTimelineItem[];
};

export type FrontendPatientDashboardResponse = {
  patient: {
    id: string;
    name: string;
    role: UserRole;
    identityVerified: boolean;
  };
  summary: {
    medicalDataCount: number;
    activeConsentsCount: number;
    recentAccessCount: number;
  };
  medicalDataCategories: {
    id: string;
    category: MedicalScope;
    label: string;
    sensitivity: string;
    available: boolean;
  }[];
  recentActivity: FrontendAuditTimelineItem[];
  quickActions: {
    label: string;
    action: string;
  }[];
};

export type FrontendShareFlowResponse = {
  patientId: string;
  availableClinic: {
    id: string;
    name: string;
    authorized: boolean;
    licenseStatus: string;
  };
  availableDoctor: {
    id: string;
    name: string;
    authorized: boolean;
    crmStatus: string;
  };
  shareableScopes: {
    category: MedicalScope;
    label: string;
    sensitivity: string;
    recommended: boolean;
  }[];
  defaultPurpose: string;
  defaultDurationHours: number;
};

export type FrontendCreStatusItem = {
  name: string;
  status: string;
  description: string;
};

export type FrontendCreStatusResponse = {
  system: string;
  items: FrontendCreStatusItem[];
  mainCreEndpoint: string;
};

export type AuthRole = "patient" | "clinic" | "doctor";

export type LoginMethod = "google" | "email" | "phone" | "passkey";

export type DemoWalletPayload = {
  provider: string;
  provider_user_id: string;
  email: string | null;
  phone: string | null;
  wallet_address: string;
  display_name: string;
  role: AuthRole | "admin";
};

export type DemoWalletItem = {
  label: string;
  loginMethod: LoginMethod;
  payload: DemoWalletPayload;
};

export type DemoWalletPayloadsResponse = {
  items: DemoWalletItem[];
  note: string;
};

export type WalletSessionResponse = {
  id: string;
  provider: string;
  provider_user_id: string;
  email: string | null;
  phone: string | null;
  wallet_address: string;
  display_name: string;
  role: AuthRole | "admin";
  available_actions: string[];
  created_at: string;
  updated_at: string;
  message: string;
};

export type NotificationStatus = "unread" | "read" | string;

export type NotificationChannel = "platform" | "email" | "sms" | string;

export type NotificationResponse = {
  id: string;
  recipient_identity_id: string;
  recipient_role: UserRole;
  patient_id: string;
  clinic_id?: string | null;
  doctor_id?: string | null;
  title: string;
  message: string;
  type: string;
  status: NotificationStatus;
  related_access_request_id?: string | null;
  channel: NotificationChannel;
  created_at: string;
  read_at?: string | null;
};

export type NotificationsApiResponse =
  | NotificationResponse[]
  | {
      value: NotificationResponse[];
      Count?: number;
      count?: number;
    };

export type DemoNotifyPatientResponse = {
  access_request: AccessRequestResponse;
  notification: NotificationResponse;
  uxCopy: string[];
  nextSteps: string[];
};

export type BusinessPlanResponse = {
  id: string;
  name: string;
  price?: string | number | null;
  description?: string;
  features?: string[];
};

export type BusinessModelResponse = {
  title?: string;
  description?: string;
  plans?: BusinessPlanResponse[];
  [key: string]: unknown;
};

export type MarketSizingResponse = {
  [key: string]: unknown;
};

export type BreakEvenResponse = {
  [key: string]: unknown;
};

export type PitchBusinessDataResponse = {
  [key: string]: unknown;
};

export type UserJourneyRoutesResponse = {
  [key: string]: unknown;
};

export type UserJourneyStorageMapResponse = {
  [key: string]: unknown;
};

export type IntegrationBusinessContractResponse = {
  [key: string]: unknown;
};