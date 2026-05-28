from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.time import utc_now
from app.db.database import get_db
from app.models.auth_identity import AuthIdentity
from app.schemas.auth_identity import (
    ALLOWED_AUTH_ROLES,
    AuthIdentityCreate,
    AuthIdentityResponse,
    AuthIdentityRoleUpdate,
    WalletSessionResponse,
)


router = APIRouter()

DEFAULT_CONSENT_REGISTRY_ADDRESS = "0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444"
DEFAULT_CHAIN_ID = 421614
DEFAULT_CHAIN_NAME = "Arbitrum Sepolia"
DEFAULT_BLOCK_EXPLORER_URL = "https://sepolia.arbiscan.io"

SUPPORTED_PROVIDERS = [
    {
        "id": "privy",
        "name": "Privy",
        "status": "recommended",
        "loginMethods": ["google", "email", "phone", "passkey"],
    },
    {
        "id": "web3auth",
        "name": "Web3Auth / MetaMask Embedded Wallets",
        "status": "supported",
        "loginMethods": ["google", "email", "phone"],
    },
    {
        "id": "dynamic",
        "name": "Dynamic",
        "status": "supported",
        "loginMethods": ["google", "email", "phone", "passkey"],
    },
]
SUPPORTED_LOGIN_METHODS = ["google", "email", "phone", "passkey"]

ROLE_ACTIONS = {
    "patient": [
        "view_own_medical_data",
        "approve_consent",
        "revoke_consent",
        "view_audit_logs",
        "manage_emergency_profile",
    ],
    "doctor": [
        "request_patient_access",
        "view_authorized_data",
        "validate_consent_status",
    ],
    "clinic": [
        "manage_doctors",
        "request_patient_access",
        "view_compliance_logs",
    ],
    "admin": [
        "view_system_overview",
        "manage_registry",
        "view_audit_logs",
    ],
}

ROLE_DESCRIPTIONS = {
    "patient": "Paciente que controla seus dados médicos e consentimentos.",
    "doctor": "Médica ou médico que solicita acesso autorizado a dados.",
    "clinic": "Clínica que gerencia solicitações e conformidade.",
    "admin": "Perfil administrativo para visão geral do sistema.",
}


def public_chain_name() -> str:
    if settings.ELO_CHAIN_NAME == "arbitrumSepolia":
        return DEFAULT_CHAIN_NAME

    return settings.ELO_CHAIN_NAME or DEFAULT_CHAIN_NAME


def public_network_config() -> dict[str, object]:
    return {
        "name": public_chain_name(),
        "chainId": settings.ELO_CHAIN_ID or DEFAULT_CHAIN_ID,
        "contractAddress": (
            settings.ELO_CONSENT_REGISTRY_ADDRESS
            or DEFAULT_CONSENT_REGISTRY_ADDRESS
        ),
        "blockExplorerUrl": (
            settings.ELO_BLOCK_EXPLORER_URL or DEFAULT_BLOCK_EXPLORER_URL
        ),
    }


def get_identity_or_404(db: Session, identity_id: str) -> AuthIdentity:
    identity = db.get(AuthIdentity, identity_id)

    if identity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auth identity not found",
        )

    return identity


def serialize_identity(identity: AuthIdentity) -> dict[str, object]:
    return {
        "id": identity.id,
        "provider": identity.provider,
        "provider_user_id": identity.provider_user_id,
        "email": identity.email,
        "phone": identity.phone,
        "wallet_address": identity.wallet_address,
        "display_name": identity.display_name,
        "role": identity.role,
        "available_actions": ROLE_ACTIONS.get(identity.role, []),
        "created_at": identity.created_at,
        "updated_at": identity.updated_at,
    }


def find_existing_identity(
    db: Session,
    payload: AuthIdentityCreate,
) -> AuthIdentity | None:
    identity = (
        db.query(AuthIdentity)
        .filter(AuthIdentity.provider == payload.provider)
        .filter(AuthIdentity.provider_user_id == payload.provider_user_id)
        .first()
    )

    if identity is not None:
        return identity

    return (
        db.query(AuthIdentity)
        .filter(AuthIdentity.wallet_address == payload.wallet_address)
        .first()
    )


def apply_identity_payload(
    identity: AuthIdentity,
    payload: AuthIdentityCreate,
) -> None:
    identity.provider = payload.provider
    identity.provider_user_id = payload.provider_user_id
    identity.email = payload.email
    identity.phone = payload.phone
    identity.wallet_address = payload.wallet_address
    identity.display_name = payload.display_name
    identity.role = payload.role
    identity.updated_at = utc_now()


@router.post(
    "/wallet-session",
    response_model=WalletSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_wallet_session(
    payload: AuthIdentityCreate,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    identity = find_existing_identity(db, payload)

    if identity is None:
        identity = AuthIdentity(id=f"auth_{uuid4().hex[:8]}")
        db.add(identity)

    apply_identity_payload(identity, payload)
    db.commit()
    db.refresh(identity)

    return {
        **serialize_identity(identity),
        "message": "Wallet abstraction session registered successfully.",
    }


@router.get(
    "/wallet-session/{identity_id}",
    response_model=AuthIdentityResponse,
)
def get_wallet_session(
    identity_id: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    identity = get_identity_or_404(db, identity_id)
    return serialize_identity(identity)


@router.get(
    "/wallet-address/{wallet_address}",
    response_model=AuthIdentityResponse,
)
def get_wallet_session_by_address(
    wallet_address: str,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    identity = (
        db.query(AuthIdentity)
        .filter(AuthIdentity.wallet_address == wallet_address)
        .first()
    )

    if identity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auth identity not found",
        )

    return serialize_identity(identity)


@router.patch(
    "/wallet-session/{identity_id}/role",
    response_model=AuthIdentityResponse,
)
def update_wallet_session_role(
    identity_id: str,
    payload: AuthIdentityRoleUpdate,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    identity = get_identity_or_404(db, identity_id)
    identity.role = payload.role
    identity.updated_at = utc_now()

    db.commit()
    db.refresh(identity)

    return serialize_identity(identity)


@router.get("/roles")
def get_auth_roles() -> dict[str, object]:
    return {
        "roles": [
            {
                "role": role,
                "description": ROLE_DESCRIPTIONS[role],
                "available_actions": ROLE_ACTIONS[role],
            }
            for role in sorted(ALLOWED_AUTH_ROLES)
        ],
        "note": (
            "Real login happens in the frontend through wallet abstraction "
            "providers such as Privy, Web3Auth or Dynamic. The backend never "
            "receives signing secrets."
        ),
    }


@router.get("/wallet-abstraction/config")
def get_wallet_abstraction_config() -> dict[str, object]:
    return {
        "authMode": "wallet_abstraction",
        "realLoginHandledBy": "frontend",
        "backendRole": "receives authenticated identity and wallet address",
        "supportedProviders": SUPPORTED_PROVIDERS,
        "supportedLoginMethods": SUPPORTED_LOGIN_METHODS,
        "requiresWalletAddress": True,
        "requiresPrivateKey": False,
        "network": public_network_config(),
    }


@router.get("/demo-wallet-payloads")
def get_demo_wallet_payloads() -> dict[str, object]:
    return {
        "items": [
            {
                "label": "Entrar com Google como Paciente",
                "loginMethod": "google",
                "payload": {
                    "provider": "privy",
                    "provider_user_id": "did:privy:demo_patient_google",
                    "email": "roseane@example.com",
                    "phone": None,
                    "wallet_address": "0x1111111111111111111111111111111111111111",
                    "display_name": "Roseane Carreiro",
                    "role": "patient",
                },
            },
            {
                "label": "Entrar com e-mail como Médica",
                "loginMethod": "email",
                "payload": {
                    "provider": "web3auth",
                    "provider_user_id": "web3auth:demo_doctor_email",
                    "email": "ana.martins@example.com",
                    "phone": None,
                    "wallet_address": "0x2222222222222222222222222222222222222222",
                    "display_name": "Dra. Ana Martins",
                    "role": "doctor",
                },
            },
            {
                "label": "Entrar com telefone como Clínica",
                "loginMethod": "phone",
                "payload": {
                    "provider": "dynamic",
                    "provider_user_id": "dynamic:demo_clinic_phone",
                    "email": None,
                    "phone": "+5521999999999",
                    "wallet_address": "0x3333333333333333333333333333333333333333",
                    "display_name": "Clínica NeuroRio",
                    "role": "clinic",
                },
            },
            {
                "label": "Entrar com passkey como Admin",
                "loginMethod": "passkey",
                "payload": {
                    "provider": "privy",
                    "provider_user_id": "did:privy:demo_admin_passkey",
                    "email": "admin@example.com",
                    "phone": None,
                    "wallet_address": "0x4444444444444444444444444444444444444444",
                    "display_name": "Admin Elo.me",
                    "role": "admin",
                },
            },
        ],
        "note": (
            "Payloads prontos para demo local sem integrar um provider real. "
            "Em produção, o frontend deve obter a wallet do provider escolhido."
        ),
    }


@router.get("/wallet-abstraction/ux-copy")
def get_wallet_abstraction_ux_copy() -> dict[str, object]:
    return {
        "headline": "Entre no Elo.me sem precisar entender blockchain",
        "subtitle": (
            "Use Google, e-mail, telefone ou passkey. Sua wallet é criada de "
            "forma invisível para proteger seus consentimentos."
        ),
        "securityNotes": [
            "O Elo.me nunca pede sua chave privada.",
            "Seus dados médicos não ficam públicos na blockchain.",
            "A blockchain registra apenas permissões, hashes e auditoria.",
        ],
        "loginButtons": [
            {
                "method": "google",
                "label": "Entrar com Google",
            },
            {
                "method": "email",
                "label": "Entrar com e-mail",
            },
            {
                "method": "phone",
                "label": "Entrar com telefone",
            },
            {
                "method": "passkey",
                "label": "Entrar com passkey",
            },
        ],
    }
