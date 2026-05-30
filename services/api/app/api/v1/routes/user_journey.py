from fastapi import APIRouter

from app.core.text import normalize_payload_text


router = APIRouter()


@router.get("/routes")
def get_user_journey_routes() -> dict[str, object]:
    return normalize_payload_text(
        {
            "patient": [
                "login tradicional",
                "dashboard",
                "receber solicitação",
                "revisar escopos",
                "aprovar ou recusar",
                "ver dados compartilhados",
                "acompanhar auditoria",
                "gerenciar assinatura",
            ],
            "doctor": [
                "login tradicional",
                "selecionar paciente",
                "solicitar acesso",
                "justificar finalidade",
                "aguardar consentimento",
                "acessar dados autorizados",
                "ver status da solicitação",
            ],
            "clinic": [
                "login tradicional",
                "gerenciar profissionais",
                "solicitar acesso para atendimento",
                "acompanhar solicitações",
                "visualizar histórico de consentimentos",
                "acessar painel de auditoria",
            ],
            "admin": [
                "acompanhar clínicas",
                "visualizar métricas",
                "revisar logs",
                "acompanhar modelo SaaS",
                "monitorar uso e compliance",
            ],
        }
    )


@router.get("/storage-map")
def get_storage_map() -> dict[str, object]:
    return normalize_payload_text(
        {
            "offChainDatabase": {
                "description": "Camada operacional privada do produto.",
                "stores": [
                    "perfis",
                    "sessões",
                    "notificações",
                    "solicitações de acesso",
                    "dados médicos fictícios ou criptografados",
                    "status de leitura",
                    "histórico operacional",
                    "dados necessários para UX",
                ],
            },
            "blockchain": {
                "description": (
                    "Registro verificável sem dados médicos sensíveis."
                ),
                "stores": [
                    "hashes",
                    "provas",
                    "eventos",
                    "consentimentos verificáveis",
                    "validações de acesso",
                    "revogações",
                    "auditoria pública sem dados sensíveis",
                ],
            },
            "chainlinkCRE": {
                "description": "Camada de orquestração e validação.",
                "responsibilities": [
                    "validar clínica, médica, consentimento e escopo",
                    "consultar API externa",
                    "ler o contrato quando necessário",
                    "escrever evento no contrato futuramente",
                    "conectar backend, blockchain e regras externas",
                ],
            },
            "futureIntegrations": [
                "provedores reais de wallet abstraction",
                "operadoras de saúde",
                "laboratórios",
                "hospitais",
                "sistemas internos de clínicas",
                "notificações push",
            ],
        }
    )
