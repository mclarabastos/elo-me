from typing import Any


MOJIBAKE_MARKERS = ("\u00c3", "\u00c2", "\ufffd")


def as_mojibake(value: str) -> str:
    return value.encode("utf-8").decode("latin1")


MOJIBAKE_REPLACEMENTS = {
    as_mojibake("Clínica"): "Clínica",
    "Cl\u00c3nica": "Clínica",
    as_mojibake("emergência"): "emergência",
    as_mojibake("Identificação"): "Identificação",
    as_mojibake("básica"): "básica",
    as_mojibake("neurológica"): "neurológica",
    as_mojibake("Validações"): "Validações",
    as_mojibake("médica"): "médica",
    as_mojibake("médicas"): "médicas",
    as_mojibake("médico"): "médico",
    as_mojibake("médicos"): "médicos",
    as_mojibake("portátil"): "portátil",
    as_mojibake("prontuário"): "prontuário",
    as_mojibake("clínica"): "clínica",
    as_mojibake("validação"): "validação",
    as_mojibake("decisão"): "decisão",
    as_mojibake("pública"): "pública",
    as_mojibake("já"): "já",
    as_mojibake("usuária"): "usuária",
    as_mojibake("produção"): "produção",
    as_mojibake("não"): "não",
    as_mojibake("são"): "são",
    as_mojibake("está"): "está",
    as_mojibake("estão"): "estão",
    as_mojibake("solicitação"): "solicitação",
    as_mojibake("autorização"): "autorização",
}


def mojibake_score(value: str) -> int:
    return sum(value.count(marker) for marker in MOJIBAKE_MARKERS)


def normalize_string(value: str) -> str:
    normalized = value
    candidates = [value]

    for encoding in ("latin1", "cp1252"):
        try:
            candidates.append(value.encode(encoding).decode("utf-8"))
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue

    normalized = min(candidates, key=mojibake_score)

    for broken, fixed in MOJIBAKE_REPLACEMENTS.items():
        normalized = normalized.replace(broken, fixed)

    return normalized.replace("\ufffd", "")


def normalize_text(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            normalize_text(key) if isinstance(key, str) else key: normalize_text(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [normalize_text(item) for item in value]

    if isinstance(value, tuple):
        return tuple(normalize_text(item) for item in value)

    if isinstance(value, str):
        return normalize_string(value)

    return value


def normalize_payload_text(value: Any) -> Any:
    return normalize_text(value)
