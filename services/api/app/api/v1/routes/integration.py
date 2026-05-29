from fastapi import APIRouter

from app.api.v1.routes.auth import SUPPORTED_PROVIDERS
from app.schemas.auth_identity import ALLOWED_AUTH_ROLES
from app.core.config import settings
from app.core.text import normalize_payload_text


router = APIRouter()


@router.get("/status")
def get_integration_status() -> dict[str, object]:
    return normalize_payload_text({
        "project": "Elo.me",
        "apiStatus": "online",
        "environment": settings.APP_ENV,
        "version": settings.API_VERSION,
        "backendReadyFor": ["frontend", "chainlink-cre", "pitch-demo"],
        "healthEndpoint": "/health",
        "docsEndpoint": "/docs",
        "demoEndpointsAvailable": True,
        "frontendEndpointsAvailable": True,
        "creValidationEndpointAvailable": True,
    })


@router.get("/frontend-contract")
def get_frontend_contract() -> dict[str, object]:
    return normalize_payload_text({
        "consumer": "frontend",
        "recommendedBaseUrlEnv": "NEXT_PUBLIC_API_URL",
        "endpoints": [
            {
                "name": "Patient Dashboard",
                "method": "GET",
                "path": "/frontend/patient-dashboard",
                "description": "Resumo principal para a dashboard da paciente.",
            },
            {
                "name": "Share Flow",
                "method": "GET",
                "path": "/frontend/share-flow",
                "description": "Dados para tela de compartilhamento seletivo.",
            },
            {
                "name": "Audit Timeline",
                "method": "GET",
                "path": "/frontend/audit-timeline",
                "description": "Histórico de acessos e auditoria.",
            },
            {
                "name": "CRE Status",
                "method": "GET",
                "path": "/frontend/cre-status",
                "description": "Resumo visual da validação por Chainlink CRE.",
            },
            {
                "name": "Run Authorized Demo",
                "method": "POST",
                "path": "/demo/run-authorized-flow",
                "description": "Executa o fluxo autorizado completo para demonstração.",
            },
            {
                "name": "Run Denied Demo",
                "method": "POST",
                "path": "/demo/run-denied-flow",
                "description": "Executa o fluxo negado completo para demonstração.",
            },
        ],
        "notes": [
            "O frontend não deve chamar diretamente dados sensíveis.",
            "O frontend deve priorizar os endpoints /frontend e /demo.",
            "Nenhum endpoint retorna payload criptografado sensível.",
        ],
    })


@router.get("/auth-contract")
def get_auth_contract() -> dict[str, object]:
    return normalize_payload_text({
        "consumer": "frontend",
        "mainEndpoint": {
            "method": "POST",
            "path": "/auth/wallet-session",
            "description": (
                "Registra ou atualiza no backend uma identidade já autenticada "
                "no frontend por wallet abstraction."
            ),
        },
        "requestExample": {
            "provider": "privy",
            "provider_user_id": "did:privy:demo_user_123",
            "email": "roseane@example.com",
            "phone": None,
            "wallet_address": "0x5547E43EF39aD62668005aA861Db8556564cEc09",
            "display_name": "Roseane Carreiro",
            "role": "patient",
        },
        "responseExample": {
            "id": "auth_demo1234",
            "provider": "privy",
            "provider_user_id": "did:privy:demo_user_123",
            "email": "roseane@example.com",
            "phone": None,
            "wallet_address": "0x5547E43EF39aD62668005aA861Db8556564cEc09",
            "display_name": "Roseane Carreiro",
            "role": "patient",
            "available_actions": [
                "view_own_medical_data",
                "approve_consent",
                "revoke_consent",
                "view_audit_logs",
                "manage_emergency_profile",
            ],
            "message": "Wallet abstraction session registered successfully.",
        },
        "requiredFields": [
            "provider",
            "provider_user_id",
            "wallet_address",
            "role",
        ],
        "optionalFields": [
            "email",
            "phone",
            "display_name",
        ],
        "acceptedRoles": sorted(ALLOWED_AUTH_ROLES),
        "acceptedProviders": [provider["id"] for provider in SUPPORTED_PROVIDERS],
        "securityNotes": [
            "O login real acontece no frontend com provider de wallet abstraction.",
            "O frontend nunca deve enviar chave privada.",
            "O backend nunca solicita seed phrase.",
            "A pessoa usuária não precisa conectar MetaMask manualmente.",
            "Para demo, o frontend pode mockar wallet_address.",
            (
                "Para produção, o frontend deve obter wallet_address do "
                "provider real."
            ),
        ],
    })


@router.get("/cre-contract")
def get_cre_contract() -> dict[str, object]:
    return normalize_payload_text({
        "consumer": "chainlink-cre",
        "mainValidationEndpoint": {
            "method": "GET",
            "path": "/external/access/validate",
            "queryParams": [
                "clinic_id",
                "doctor_id",
                "consent_id",
                "requested_scopes",
            ],
            "example": (
                "/external/access/validate?clinic_id=clinic_neurorio"
                "&doctor_id=doctor_ana&consent_id=consent_demo"
                "&requested_scopes=allergies,medications"
            ),
        },
        "supportEndpoints": [
            {
                "method": "GET",
                "path": "/external/clinics/{clinic_id}/verify",
            },
            {
                "method": "GET",
                "path": "/external/doctors/{doctor_id}/verify",
            },
            {
                "method": "GET",
                "path": "/external/consents/{consent_id}/verify",
            },
        ],
        "expectedDecisionValues": ["AUTHORIZED", "DENIED"],
        "importantFields": [
            "decision",
            "reason",
            "validatedBy",
            "clinicAuthorized",
            "doctorAuthorized",
            "doctorBelongsToClinic",
            "consentValid",
            "scopeValid",
            "requestedScopes",
            "allowedScopes",
        ],
        "notes": [
            (
                "A rota /external/access/validate simula uma API externa "
                "que pode ser consumida pelo Chainlink CRE."
            ),
            "Toda validação bem formada gera um AuditLog.",
            (
                "O CRE deve usar a decisão AUTHORIZED ou DENIED como "
                "resultado da orquestração."
            ),
        ],
    })


@router.get("/pitch-script-data")
def get_pitch_script_data() -> dict[str, object]:
    return normalize_payload_text({
        "pitchFlow": [
            {
                "step": 1,
                "title": "Paciente possui dados médicos portáteis",
                "backendEvidence": "/frontend/patient-dashboard",
            },
            {
                "step": 2,
                "title": "Clínica solicita acesso",
                "backendEvidence": "/access-requests",
            },
            {
                "step": 3,
                "title": "Paciente aprova somente parte dos dados",
                "backendEvidence": "/consents/approve",
            },
            {
                "step": 4,
                "title": "CRE valida clínica, médica, consentimento e escopos",
                "backendEvidence": "/external/access/validate",
            },
            {
                "step": 5,
                "title": "Somente dados autorizados são liberados",
                "backendEvidence": "/consents/{consent_id}/authorized-medical-data",
            },
            {
                "step": 6,
                "title": "Acesso fica registrado em auditoria",
                "backendEvidence": "/patients/patient_rose/audit-logs",
            },
        ],
        "demoRecommendation": [
            "Executar POST /demo/reset-local-demo-data",
            "Executar POST /demo/run-authorized-flow",
            "Abrir GET /frontend/patient-dashboard",
            "Abrir GET /frontend/audit-timeline",
            "Executar POST /demo/run-denied-flow",
            "Mostrar que acesso fora do consentimento é negado",
        ],
    })
