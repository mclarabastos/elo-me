import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  AccessRequestCreate,
  AccessRequestResponse,
  AccessRequestStatusUpdate,
  AccessValidateParams,
  AccessValidateResponse,
  ClinicResponse,
  ConsentApproveRequest,
  ConsentResponse,
  ConsentRevokeRequest,
  ConsentVerifyResponse,
  DoctorResponse,
  ExternalClinicVerifyResponse,
  ExternalConsentVerifyResponse,
  ExternalDoctorVerifyResponse,
  HealthResponse,
  MedicalDataResponse,
  UserResponse,
} from "@/types/api";

export function getHealth() {
  return apiClient<HealthResponse>(API_ENDPOINTS.health);
}

export function getDemoUser() {
  return apiClient<UserResponse>(API_ENDPOINTS.users.demo);
}

export function getDemoClinic() {
  return apiClient<ClinicResponse>(API_ENDPOINTS.clinics.demo);
}

export function getDemoDoctor() {
  return apiClient<DoctorResponse>(API_ENDPOINTS.doctors.demo);
}

export function getPatientMedicalData(patientId: string) {
  return apiClient<MedicalDataResponse[]>(
    API_ENDPOINTS.patients.medicalData(patientId)
  );
}

export function getPatientAccessRequests(patientId: string) {
  return apiClient<AccessRequestResponse[]>(
    API_ENDPOINTS.patients.accessRequests(patientId)
  );
}

export function createAccessRequest(payload: AccessRequestCreate) {
  return apiClient<AccessRequestResponse>(API_ENDPOINTS.accessRequests.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAccessRequest(accessRequestId: string) {
  return apiClient<AccessRequestResponse>(
    API_ENDPOINTS.accessRequests.byId(accessRequestId)
  );
}

export function updateAccessRequestStatus(
  accessRequestId: string,
  payload: AccessRequestStatusUpdate
) {
  return apiClient<AccessRequestResponse>(
    API_ENDPOINTS.accessRequests.status(accessRequestId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export function approveConsent(payload: ConsentApproveRequest) {
  return apiClient<ConsentResponse>(API_ENDPOINTS.consents.approve, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function revokeConsent(payload: ConsentRevokeRequest) {
  return apiClient<ConsentResponse>(API_ENDPOINTS.consents.revoke, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getConsent(consentId: string) {
  return apiClient<ConsentResponse>(API_ENDPOINTS.consents.byId(consentId));
}

export function verifyConsent(consentId: string) {
  return apiClient<ConsentVerifyResponse>(
    API_ENDPOINTS.consents.verify(consentId)
  );
}

export function getAuthorizedMedicalData(consentId: string) {
  return apiClient<MedicalDataResponse[]>(
    API_ENDPOINTS.consents.authorizedMedicalData(consentId)
  );
}

export function verifyExternalClinic(clinicId: string) {
  return apiClient<ExternalClinicVerifyResponse>(
    API_ENDPOINTS.external.verifyClinic(clinicId)
  );
}

export function verifyExternalDoctor(doctorId: string) {
  return apiClient<ExternalDoctorVerifyResponse>(
    API_ENDPOINTS.external.verifyDoctor(doctorId)
  );
}

export function verifyExternalConsent(consentId: string) {
  return apiClient<ExternalConsentVerifyResponse>(
    API_ENDPOINTS.external.verifyConsent(consentId)
  );
}

export function validateExternalAccess(params: AccessValidateParams) {
  const searchParams = new URLSearchParams({
    clinic_id: params.clinic_id,
    doctor_id: params.doctor_id,
    consent_id: params.consent_id,
    requested_scopes: params.requested_scopes.join(","),
  });

  return apiClient<AccessValidateResponse>(
    `${API_ENDPOINTS.external.validateAccess}?${searchParams.toString()}`
  );
}