MOJIBAKE_MARKERS = ("Ã", "Â", "�")

MOJIBAKE_REPLACEMENTS = {
    "ClÃnica": "Clínica",
    "ClÃ­nica": "Clínica",
    "emergÃªncia": "emergência",
    "IdentificaÃ§Ã£o": "Identificação",
    "bÃ¡sica": "básica",
    "neurolÃ³gica": "neurológica",
    "ValidaÃ§Ãµes": "Validações",
    "mÃ©dica": "médica",
    "mÃ©dicas": "médicas",
    "mÃ©dico": "médico",
    "mÃ©dicos": "médicos",
    "jÃ¡": "já",
    "usuÃ¡ria": "usuária",
    "produÃ§Ã£o": "produção",
    "nÃ£o": "não",
    "sÃ£o": "são",
    "estÃ¡": "está",
    "estÃ£o": "estão",
    "solicitaÃ§Ã£o": "solicitação",
    "autorizaÃ§Ã£o": "autorização",
    "auditoria": "auditoria",
}


def normalize_text(value: str) -> str:
    if not any(marker in value for marker in MOJIBAKE_MARKERS):
        return value

    normalized = value

    try:
        decoded = value.encode("latin1").decode("utf-8")
        if sum(decoded.count(marker) for marker in MOJIBAKE_MARKERS) < sum(
            value.count(marker) for marker in MOJIBAKE_MARKERS
        ):
            normalized = decoded
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass

    for broken, fixed in MOJIBAKE_REPLACEMENTS.items():
        normalized = normalized.replace(broken, fixed)

    return normalized.replace("�", "")


def normalize_payload_text(value):
    if isinstance(value, dict):
        return {
            normalize_text(key) if isinstance(key, str) else key: normalize_payload_text(
                item
            )
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [normalize_payload_text(item) for item in value]

    if isinstance(value, str):
        return normalize_text(value)

    return value
