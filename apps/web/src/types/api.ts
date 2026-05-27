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
  | "rejected"
  | "revoked"
  | string;

export type RequesterType = "clinic" | "doctor" | string;

export type AccessDecision = "AUTHORIZED" | "DENIED" | string;

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