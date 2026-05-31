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
            {
                "name": "Business Model",
                "method": "GET",
                "path": "/business/model",
                "description": "Modelo de negócio SaaS premium do Elo.me.",
            },
            {
                "name": "Market Sizing",
                "method": "GET",
                "path": "/business/market-sizing",
                "description": "TAM, SAM, SOM e simulação de receita para pitch.",
            },
            {
                "name": "Break Even",
                "method": "GET",
                "path": "/business/break-even",
                "description": "Cenários mínimos para manter a plataforma.",
            },
            {
                "name": "Pitch Business Data",
                "method": "GET",
                "path": "/business/pitch-business-data",
                "description": "Textos comerciais curtos para slides e narrativa.",
            },
            {
                "name": "Notifications",
                "method": "GET",
                "path": "/notifications/{identity_id}",
                "description": "Lista notificações de uma identidade autenticada.",
            },
            {
                "name": "Demo Notify Patient",
                "method": "POST",
                "path": "/access-requests/demo-notify-patient",
                "description": "Cria uma solicitação demo e notifica a paciente.",
            },
            {
                "name": "User Journey Routes",
                "method": "GET",
                "path": "/user-journey/routes",
                "description": "Jornadas por perfil: paciente, médica, clínica e admin.",
            },
            {
                "name": "Storage Map",
                "method": "GET",
                "path": "/user-journey/storage-map",
                "description": "Explica o que fica off-chain, on-chain e no Chainlink CRE.",
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
            "O backend nunca solicita frase de recuperação.",
            "A pessoa usuária não precisa conectar MetaMask manualmente.",
            "Para demo, o frontend pode mockar wallet_address.",
            (
                "Para produção, o frontend deve obter wallet_address do "
                "provider real."
            ),
        ],
    })


@router.get("/business-contract")
def get_business_contract() -> dict[str, object]:
    return normalize_payload_text(
        {
            "consumer": "frontend",
            "businessEndpoints": [
                {
                    "method": "GET",
                    "path": "/business/model",
                    "description": "Modelo de negócio, público alvo, proposta de valor e planos.",
                },
                {
                    "method": "GET",
                    "path": "/business/market-sizing",
                    "description": "Tamanho de mercado com TAM, SAM, SOM e receita simulada.",
                },
                {
                    "method": "GET",
                    "path": "/business/break-even",
                    "description": "Cenários de faturamento mínimo para manter a plataforma.",
                },
                {
                    "method": "GET",
                    "path": "/business/pitch-business-data",
                    "description": "Frases comerciais prontas para pitch.",
                },
            ],
            "notificationEndpoints": [
                {
                    "method": "POST",
                    "path": "/access-requests/demo-notify-patient",
                    "description": "Cria solicitação demo e notificação para a paciente.",
                },
                {
                    "method": "GET",
                    "path": "/notifications/{identity_id}",
                    "description": "Lista notificações da identidade autenticada.",
                },
                {
                    "method": "PATCH",
                    "path": "/notifications/{notification_id}/read",
                    "description": "Marca notificação como lida.",
                },
            ],
            "journeyEndpoints": [
                {
                    "method": "GET",
                    "path": "/user-journey/routes",
                    "description": "Jornadas por perfil para orientar telas do produto.",
                },
                {
                    "method": "GET",
                    "path": "/user-journey/storage-map",
                    "description": "Mapa de registro entre banco, blockchain e Chainlink CRE.",
                },
            ],
            "suggestedFrontendSections": [
                "Hero comercial",
                "Problema: vazamento e fragmentação de dados médicos",
                "Como funciona",
                "Quem paga",
                "Planos",
                "Tamanho de mercado",
                "Simulação de receita",
                "Break-even",
                "Jornada do paciente",
                "Notificações",
                "Expansão para operadoras",
                "Disclaimer de projeção mockada",
            ],
            "notes": [
                "Números financeiros são simulações mockadas para pitch.",
                "Dados médicos sensíveis permanecem off-chain.",
                "Blockchain registra apenas provas, hashes, consentimentos e eventos.",
            ],
        }
    )


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
                "step": 0,
                "title": "Problema real: vazamento e fragmentação de dados médicos",
                "backendEvidence": "/business/pitch-business-data",
            },
            {
                "step": 1,
                "title": "Wallet abstraction permite login tradicional sem expor complexidade blockchain",
                "backendEvidence": "/auth/wallet-abstraction/config",
            },
            {
                "step": 2,
                "title": "Paciente possui prontuário portátil e dados sensíveis off-chain",
                "backendEvidence": "/frontend/patient-dashboard",
            },
            {
                "step": 3,
                "title": "Médica ou clínica solicita acesso e paciente recebe notificação",
                "backendEvidence": "/access-requests/demo-notify-patient",
            },
            {
                "step": 4,
                "title": "Paciente aprova tudo, aprova parcialmente ou recusa",
                "backendEvidence": "/consents/approve",
            },
            {
                "step": 5,
                "title": "Chainlink CRE valida clínica, médica, consentimento e escopos",
                "backendEvidence": "/external/access/validate",
            },
            {
                "step": 6,
                "title": "Somente dados autorizados são liberados",
                "backendEvidence": "/consents/{consent_id}/authorized-medical-data",
            },
            {
                "step": 7,
                "title": "Acesso fica registrado em auditoria",
                "backendEvidence": "/patients/patient_rose/audit-logs",
            },
            {
                "step": 8,
                "title": "Cada interação tem mapa claro entre off-chain, blockchain e CRE",
                "backendEvidence": "/user-journey/storage-map",
            },
            {
                "step": 9,
                "title": "Modelo SaaS premium B2B2C sustenta expansão comercial",
                "backendEvidence": "/business/model",
            },
            {
                "step": 10,
                "title": "Market sizing, planos e break-even mostram viabilidade de negócio",
                "backendEvidence": "/business/market-sizing",
            },
        ],
        "demoRecommendation": [
            "Executar POST /demo/reset-local-demo-data",
            "Executar POST /access-requests/demo-notify-patient",
            "Executar POST /demo/run-authorized-flow",
            "Abrir GET /frontend/patient-dashboard",
            "Abrir GET /frontend/audit-timeline",
            "Executar POST /demo/run-denied-flow",
            "Mostrar que acesso fora do consentimento é negado",
            "Abrir GET /business/break-even",
        ],
    })
