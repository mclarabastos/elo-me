from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
            "receives a private key."
        ),
    }
