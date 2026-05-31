# Elo.me

Prontuário médico portátil com consentimento verificável, privacidade seletiva e auditoria em blockchain.

O paciente paga por consultas e exames, mas raramente tem controle real sobre seu próprio histórico. Esse histórico fica preso em sistemas fechados, papéis e clínicas — e quando ele muda de médico, precisa reconstruir tudo do zero.

O Elo.me resolve isso: o paciente possui seu histórico, escolhe o que compartilhar, com quem e por quanto tempo. O médico acessa o que é clinicamente relevante. Nada além disso.

---

## Demo

| Recurso | URL |
| ------- | --- |
| Frontend | https://elo-me-web.vercel.app |
| Backend API | https://elo-me.onrender.com |
| API Docs (Swagger) | https://elo-me.onrender.com/docs |
| Status CRE | https://elo-me.onrender.com/frontend/cre-status |
| Contrato EloConsentRegistry | [`0x5eD8...0E444`](https://sepolia.arbiscan.io/address/0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444) na Arbitrum Sepolia |

---

## Como funciona

Arquitetura híbrida off-chain / on-chain:

- **Documentos médicos** → armazenados off-chain, criptografados via IPFS/Pinata
- **Blockchain** → registra apenas hashes, permissões, revogações e logs de auditoria
- **Chainlink CRE** → orquestra as verificações entre APIs externas, contratos e o sistema off-chain

O prontuário real nunca vai para a blockchain. Apenas a prova de que ele existe — e que o acesso foi ou não autorizado.

### Contrato EloConsentRegistry

O contrato **não armazena dados médicos reais**. Ele funciona como um cartório on-chain para provas, consentimentos e eventos de auditoria.

**O que vai on-chain:** hashes de paciente, clínica, médico, consentimento e escopos; status de consentimento; eventos de auditoria.

**O que nunca vai on-chain:** prontuário, CPF, diagnóstico, laudo, alergias, medicamentos ou qualquer dado médico sensível.

| Contrato | Endereço | Rede |
| -------- | -------- | ---- |
| EloConsentRegistry | `0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444` | Arbitrum Sepolia |
| CRE Forwarder | `0x5547E43EF39aD62668005aA861Db8556564cEc09` | Arbitrum Sepolia |

---

## Stack

| Camada | Tecnologia |
| ------ | ---------- |
| Frontend | Next.js + React + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI + Python + SQLAlchemy |
| Banco de dados | SQLite (demo) / PostgreSQL (produção) |
| Armazenamento | IPFS / Pinata |
| Orquestração | Chainlink CRE |
| Blockchain | Arbitrum Sepolia (EVM) |

---

## MVP do Hackathon

Fluxo completo de segunda opinião médica com consentimento seletivo:

| # | Etapa |
| - | ----- |
| 1 | Paciente cria identidade na plataforma |
| 2 | Clínica envia documento médico |
| 3 | Documento é criptografado e armazenado off-chain |
| 4 | Hash do documento é registrado on-chain |
| 5 | Nova clínica solicita acesso ao histórico |
| 6 | Paciente aprova acesso parcial |
| 7 | CRE verifica se a clínica/profissional está ativo via `GET /external/access/validate` |
| 8 | CRE verifica consentimento on-chain e valida escopo |
| 9 | Acesso liberado apenas para os dados autorizados |
| 10 | Evento de auditoria registrado on-chain |

> ZK Proofs estão fora do escopo do MVP. O foco é o fluxo CRE funcional com consentimento granular verificável.

---

## Estrutura do repositório

```
.
├── apps/web                        # Frontend Next.js
├── services/api                    # Backend FastAPI
├── chainlink/cre                   # Workflow Chainlink CRE (elo-me-access-validator)
├── chainlink/contracts             # Contrato EloConsentRegistry (Solidity)
├── infra/ipfs                      # Configuração IPFS/Pinata
└── docs                            # Documentação técnica
```

---

## Início rápido

**Pré-requisitos:** Node.js 20+, pnpm 9+, Python 3.11+, conta Pinata, ferramentas Chainlink CRE.

```bash
pnpm install
cp .env.example .env
# preencha as variáveis no .env antes de continuar
```

**Frontend:**

```bash
pnpm dev:web
```

**Backend:**

```bash
cd services/api
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Chainlink CRE (simulação):**

```bash
cd chainlink/cre/elo-me-access-validator
bun install
cre workflow simulate . --target=staging-settings
```

---

## Variáveis de ambiente

```env
# Frontend
NEXT_PUBLIC_API_URL=https://elo-me.onrender.com
NEXT_PUBLIC_APP_URL=https://elo-me-web.vercel.app

# Backend
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=

# IPFS / Pinata
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
PINATA_GATEWAY_URL=

# Chainlink / Web3
CRE_ETH_PRIVATE_KEY=
RPC_URL=
CHAIN_ID=421614
CONTRACT_ADDRESS=0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444
```

---

## Scripts

| Comando | O que faz |
| ------- | --------- |
| `pnpm dev` | Sobe o ambiente completo |
| `pnpm dev:web` | Apenas o frontend |
| `pnpm dev:api` | Apenas o backend |
| `pnpm build` | Build de produção |
| `pnpm lint` | Lint geral |
| `pnpm test:api` | Testes do backend |

---

## Limitações conhecidas do MVP

- Os serviços internos do backend (`services/`) são stubs — a lógica de negócio está diretamente nas rotas para simplificar a demo.
- O `packages/design-system` é um scaffold ainda não integrado ao frontend.
- Os testes do backend (`tests/`) são placeholders — a cobertura real está no fluxo de demo via Swagger.
- O banco de dados usa SQLite em vez de PostgreSQL para facilitar o deploy de demo.
- O frontend não tem autenticação real — as identidades são fixas para a demo.

---

## Deploy

| Serviço | Plataforma |
| ------- | ---------- |
| Frontend | Vercel |
| Backend | Render |
| Banco | SQLite (demo) / Neon ou Supabase para produção |
| Storage | Pinata / IPFS |
| Workflows CRE | Ambiente Chainlink CRE |

---

## Licença

MIT
