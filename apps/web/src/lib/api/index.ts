import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

import type {
  AccessRequestCreate,
  AccessRequestResponse,
  AccessRequestStatusUpdate,
  AccessValidateParams,
  AccessValidateResponse,
  AuthRole,
  BreakEvenResponse,
  BusinessModelResponse,
  ClinicResponse,
  ConsentApproveRequest,
  ConsentResponse,
  ConsentRevokeRequest,
  ConsentVerifyResponse,
  DemoNotifyPatientResponse,
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
  IntegrationBusinessContractResponse,
  LoginMethod,
  MarketSizingResponse,
  MedicalDataResponse,
  NotificationResponse,
  NotificationsApiResponse,
  PitchBusinessDataResponse,
  UserJourneyRoutesResponse,
  UserJourneyStorageMapResponse,
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
    API_ENDPOINTS.patients.medicalData(patientId),
  );
}

export async function getPatientAccessRequests(
  patientId: string,
): Promise<AccessRequestResponse[]> {
  const data = await apiClient<
    | AccessRequestResponse[]
    | {
        value: AccessRequestResponse[];
        Count?: number;
        count?: number;
      }
  >(API_ENDPOINTS.patients.accessRequests(patientId));

  if (Array.isArray(data)) {
    return data;
  }

  return data.value ?? [];
}

export function createAccessRequest(payload: AccessRequestCreate) {
  return apiClient<AccessRequestResponse>(API_ENDPOINTS.accessRequests.root, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAccessRequest(accessRequestId: string) {
  return apiClient<AccessRequestResponse>(
    API_ENDPOINTS.accessRequests.byId(accessRequestId),
  );
}

export function updateAccessRequestStatus(
  accessRequestId: string,
  payload: AccessRequestStatusUpdate,
) {
  return apiClient<AccessRequestResponse>(
    API_ENDPOINTS.accessRequests.status(accessRequestId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
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
    API_ENDPOINTS.consents.verify(consentId),
  );
}

export function getAuthorizedMedicalData(consentId: string) {
  return apiClient<MedicalDataResponse[]>(
    API_ENDPOINTS.consents.authorizedMedicalData(consentId),
  );
}

export function verifyExternalClinic(clinicId: string) {
  return apiClient<ExternalClinicVerifyResponse>(
    API_ENDPOINTS.external.verifyClinic(clinicId),
  );
}

export function verifyExternalDoctor(doctorId: string) {
  return apiClient<ExternalDoctorVerifyResponse>(
    API_ENDPOINTS.external.verifyDoctor(doctorId),
  );
}

export function verifyExternalConsent(consentId: string) {
  return apiClient<ExternalConsentVerifyResponse>(
    API_ENDPOINTS.external.verifyConsent(consentId),
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
    `${API_ENDPOINTS.external.validateAccess}?${searchParams.toString()}`,
  );
}

export function getFrontendPatientDashboard() {
  return apiClient<FrontendPatientDashboardResponse>(
    API_ENDPOINTS.frontend.patientDashboard,
  );
}

export function getFrontendShareFlow() {
  return apiClient<FrontendShareFlowResponse>(
    API_ENDPOINTS.frontend.shareFlow,
  );
}

export function getFrontendAuditTimeline() {
  return apiClient<FrontendAuditTimelineResponse>(
    API_ENDPOINTS.frontend.auditTimeline,
  );
}

export function getFrontendCreStatus() {
  return apiClient<FrontendCreStatusResponse>(
    API_ENDPOINTS.frontend.creStatus,
  );
}

export function getDemoWalletPayloads() {
  return apiClient<DemoWalletPayloadsResponse>(
    API_ENDPOINTS.auth.demoWalletPayloads,
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
  selectedMethod: LoginMethod,
) {
  const data = await getDemoWalletPayloads();

  const item = data.items.find((entry) => entry.payload.role === role);

  if (!item) {
    throw new Error(
      `Não encontramos um payload demo para o perfil selecionado.`,
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

export async function getNotifications(
  identityId: string,
): Promise<NotificationResponse[]> {
  const data = await apiClient<NotificationsApiResponse>(
    API_ENDPOINTS.notifications.byIdentity(identityId),
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.value ?? [];
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationResponse> {
  return apiClient<NotificationResponse>(
    API_ENDPOINTS.notifications.markAsRead(notificationId),
    {
      method: "PATCH",
    },
  );
}

export async function createDemoPatientNotification(): Promise<DemoNotifyPatientResponse> {
  return apiClient<DemoNotifyPatientResponse>(
    API_ENDPOINTS.accessRequests.demoNotifyPatient,
    {
      method: "POST",
    },
  );
}

export async function getBusinessModel(): Promise<BusinessModelResponse> {
  return apiClient<BusinessModelResponse>(API_ENDPOINTS.business.model);
}

export async function getBusinessMarketSizing(): Promise<MarketSizingResponse> {
  return apiClient<MarketSizingResponse>(API_ENDPOINTS.business.marketSizing);
}

export async function getBusinessBreakEven(): Promise<BreakEvenResponse> {
  return apiClient<BreakEvenResponse>(API_ENDPOINTS.business.breakEven);
}

export async function getPitchBusinessData(): Promise<PitchBusinessDataResponse> {
  return apiClient<PitchBusinessDataResponse>(
    API_ENDPOINTS.business.pitchBusinessData,
  );
}

export async function getUserJourneyRoutes(): Promise<UserJourneyRoutesResponse> {
  return apiClient<UserJourneyRoutesResponse>(API_ENDPOINTS.userJourney.routes);
}

export async function getUserJourneyStorageMap(): Promise<UserJourneyStorageMapResponse> {
  return apiClient<UserJourneyStorageMapResponse>(
    API_ENDPOINTS.userJourney.storageMap,
  );
}

export async function getIntegrationBusinessContract(): Promise<IntegrationBusinessContractResponse> {
  return apiClient<IntegrationBusinessContractResponse>(
    API_ENDPOINTS.integration.businessContract,
  );
}