import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  AccessRequestCreate,
  AccessRequestResponse,
  AccessRequestStatusUpdate,
  AccessValidateParams,
  AccessValidateResponse,
  AuthRole,
  ClinicResponse,
  ConsentApproveRequest,
  ConsentResponse,
  ConsentRevokeRequest,
  ConsentVerifyResponse,
  DemoWalletPayload,
  DemoWalletPayloadsResponse,
  DoctorResponse,
  ExternalClinicVerifyResponse,
  ExternalConsentVerifyResponse,
  ExternalDoctorVerifyResponse,
  FrontendAuditTimelineResponse,
  FrontendCreStatusResponse,
  FrontendPatientDashboardResponse,
  FrontendShareFlowResponse,
  HealthResponse,
  LoginMethod,
  MedicalDataResponse,
  UserResponse,
  WalletSessionResponse,
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

export function getFrontendPatientDashboard() {
  return apiClient<FrontendPatientDashboardResponse>(
    API_ENDPOINTS.frontend.patientDashboard
  );
}

export function getFrontendShareFlow() {
  return apiClient<FrontendShareFlowResponse>(
    API_ENDPOINTS.frontend.shareFlow
  );
}

export function getFrontendAuditTimeline() {
  return apiClient<FrontendAuditTimelineResponse>(
    API_ENDPOINTS.frontend.auditTimeline
  );
}

export function getFrontendCreStatus() {
  return apiClient<FrontendCreStatusResponse>(
    API_ENDPOINTS.frontend.creStatus
  );
}

export function getDemoWalletPayloads() {
  return apiClient<DemoWalletPayloadsResponse>(
    API_ENDPOINTS.auth.demoWalletPayloads
  );
}

export function createWalletSession(payload: DemoWalletPayload) {
  return apiClient<WalletSessionResponse>(API_ENDPOINTS.auth.walletSession, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDashboardRouteByRole(role: AuthRole) {
  const routes: Record<AuthRole, string> = {
    patient: "/patient/dashboard",
    clinic: "/clinic/dashboard",
    doctor: "/doctor/dashboard",
  };

  return routes[role];
}

export async function loginWithDemoWallet(
  role: AuthRole,
  selectedMethod: LoginMethod
) {
  const data = await getDemoWalletPayloads();

  // Na demo, o método escolhido é visual/UX.
  // O payload enviado ao backend é definido pelo perfil selecionado.
  const item = data.items.find((entry) => entry.payload.role === role);

  if (!item) {
    throw new Error(
      `Não encontramos um payload demo para o perfil selecionado.`
    );
  }

  const session = await createWalletSession(item.payload);

  if (typeof window !== "undefined") {
    localStorage.setItem("elo.me.auth_session", JSON.stringify(session));
    localStorage.setItem("elo.me.role", String(session.role));
    localStorage.setItem("elo.me.identity_id", session.id);
    localStorage.setItem("elo.me.wallet_address", session.wallet_address);
    localStorage.setItem("elo.me.display_name", session.display_name);
    localStorage.setItem("elo.me.demo_login_method", selectedMethod);
    localStorage.setItem("elo.me.backend_login_method", item.loginMethod);
  }

  return {
    session,
    route: getDashboardRouteByRole(role),
  };
}