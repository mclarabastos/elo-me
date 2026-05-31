# elo-me-access-validator

Workflow Chainlink CRE que valida consentimentos de acesso a prontuários médicos via DON (Decentralized Oracle Network).

## Executar simulação

```bash
# Da raiz do repositório
cre workflow simulate ./chainlink/cre/elo-me-access-validator --target=staging-settings
```

## Instalar dependências

```bash
bun install
```

## Executar testes

```bash
bun test
```

## Como funciona

O workflow consulta o backend Elo.me a cada 30 segundos, verifica se o consentimento do paciente está ativo para o médico/clínica solicitante, e registra a decisão (`AUTHORIZED` ou `DENIED`) on-chain via EloConsentRegistry na Arbitrum Sepolia.

Consulte o [README do CRE](../README.md) para detalhes completos.
