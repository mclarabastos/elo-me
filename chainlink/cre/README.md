# Chainlink CRE — Elo.me Access Validator

Este diretório contém o workflow Chainlink CRE (Compute Runtime Environment) responsável por validar consentimentos de acesso a prontuários médicos de forma descentralizada.

## Como funciona

O workflow roda em um DON (Decentralized Oracle Network) e valida cada requisição de acesso ao prontuário de um paciente antes de registrar a decisão on-chain.

```
Cron Trigger (30s)
    → HTTP GET Elo.me API /consent/validate
    → consensusIdenticalAggregation (todos os nós concordam)
    → Decisão AUTHORIZED | DENIED
    → Registro imutável na Arbitrum Sepolia
```

## Estrutura

```
chainlink/cre/
├── elo-me-access-validator/   # Workflow principal
│   ├── main.ts                # Lógica do workflow (CRE SDK)
│   ├── main.test.ts           # Testes de simulação
│   ├── workflow.yaml          # Configuração do workflow
│   ├── config.staging.json    # Config para Arbitrum Sepolia (testnet)
│   ├── config.production.json # Config para produção
│   └── package.json
├── project.yaml               # Configuração de targets (staging/production)
├── secrets.yaml               # Secrets (não commitado)
├── simulations/               # Simulações de outros workflows
├── triggers/                  # Exemplos de triggers (cron, evm-log, http)
├── workflows/                 # Outros workflows do projeto
└── CRE-Elo.me_Access_Validator.json  # Export do workflow
```

## Contratos deployados

| Contrato | Endereço | Rede |
|---|---|---|
| EloConsentRegistry | `0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444` | Arbitrum Sepolia |
| CRE Forwarder | `0x5547E43EF39aD62668005aA861Db8556564cEc09` | Arbitrum Sepolia |

## Pré-requisitos

- [Chainlink CRE CLI](https://docs.chain.link/chainlink-automation) instalado
- [Bun](https://bun.sh) >= 1.0
- Chave privada com ETH na Arbitrum Sepolia (para simulações com escrita on-chain)

## Configuração

1. Crie o arquivo `.env` na raiz do projeto:

```bash
CRE_ETH_PRIVATE_KEY=<sua_chave_privada>
```

2. Instale as dependências:

```bash
cd chainlink/cre/elo-me-access-validator
bun install
```

## Simulação

Execute a partir da raiz do repositório:

```bash
cre workflow simulate ./chainlink/cre/elo-me-access-validator --target=staging-settings
```

Saída esperada:

```
[Elo.me] DON consensus: AUTHORIZED ✓
{"decision":"APPROVED","network":"arbitrum-sepolia"}
✓ Simulation complete!
```

## Variáveis de configuração

| Campo | Descrição |
|---|---|
| `validatorUrl` | URL do backend Elo.me (`https://elo-me.onrender.com`) |
| `clinicId` | ID da clínica solicitando acesso |
| `doctorId` | ID do médico solicitando acesso |
| `consentId` | Hash do consentimento registrado |
| `patientAddress` | Endereço wallet do paciente |
| `contractAddress` | Endereço do EloConsentRegistry |
| `creForwarder` | Endereço do CRE Forwarder |

## Referências

- [Chainlink CRE Docs](https://docs.chain.link)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io)
- [Backend API](https://elo-me.onrender.com)
- [Repositório](https://github.com/mclarabastos/elo-me)
