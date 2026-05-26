# Elo.me

Prontuário médico portátil com consentimento verificável, privacidade seletiva e auditoria em blockchain.

O paciente paga por consultas e exames, mas raramente tem controle real sobre seu próprio histórico. Esse histórico fica preso em sistemas fechados, papéis e clínicas — e quando ele muda de médico, precisa reconstruir tudo do zero.

O Elo.me resolve isso: o paciente possui seu histórico, escolhe o que compartilhar, com quem e por quanto tempo. O médico acessa o que é clinicamente relevante. Nada além disso.

---

## Como funciona

Arquitetura híbrida off-chain / on-chain:

- **Documentos médicos** → armazenados off-chain, criptografados via IPFS/Pinata
- **Blockchain** → registra apenas hashes, permissões, revogações e logs de auditoria
- **Chainlink CRE** → orquestra as verificações entre APIs externas, contratos e o sistema off-chain

O prontuário real nunca vai para a blockchain. Apenas a prova de que ele existe — e que o acesso foi ou não autorizado.

---

## Stack

| Camada         | Tecnologia                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | Next.js + React + TypeScript + Tailwind CSS + shadcn/ui |
| Backend        | FastAPI + Python + SQLAlchemy                           |
| Banco de dados | PostgreSQL                                              |
| Armazenamento  | IPFS / Pinata                                           |
| Orquestração   | Chainlink CRE                                           |
| Blockchain     | EVM (escopo a definir no MVP)                           |

---

## Estrutura do repositório

```txt
.
├── apps/web                  # Frontend Next.js
├── services/api              # Backend FastAPI
├── packages/design-system    # Tokens e componentes compartilhados
├── chainlink/cre             # Workflows Chainlink CRE
├── chainlink/contracts       # Contratos opcionais
├── infra/ipfs                # Configuração IPFS/Pinata
└── docs                      # Documentação técnica
```

---

## MVP do Hackathon

Fluxo completo de segunda opinião médica com consentimento seletivo:

| #   | Etapa                                               |
| --- | --------------------------------------------------- |
| 1   | Paciente cria identidade na plataforma              |
| 2   | Clínica envia documento médico                      |
| 3   | Documento é criptografado e armazenado off-chain    |
| 4   | Hash do documento é registrado on-chain             |
| 5   | Nova clínica solicita acesso ao histórico           |
| 6   | Paciente aprova acesso parcial                      |
| 7   | CRE verifica se a clínica/profissional está ativo   |
| 8   | CRE verifica consentimento on-chain e valida escopo |
| 9   | Acesso liberado apenas para os dados autorizados    |
| 10  | Evento de auditoria registrado on-chain             |

> ZK Proofs estão fora do escopo do MVP. O foco é o fluxo CRE funcional com consentimento granular verificável.

---

## Início rápido

**Pré-requisitos:** Node.js 20+, pnpm 9+, Python 3.11+, PostgreSQL, conta Pinata, ferramentas Chainlink CRE.

```bash
pnpm install
cp .env.example .env
```

Frontend:

```bash
pnpm dev:web
```

Backend:

```bash
cd services/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Variáveis de ambiente

Referência completa em `.env.example`. Nunca commite secrets reais.

```env
# Cliente
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=

# Servidor
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=

# IPFS / Pinata
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
PINATA_GATEWAY_URL=

# Chainlink / Web3
CHAINLINK_CRE_ENV=
RPC_URL=
PRIVATE_KEY=
CHAIN_ID=
CONTRACT_ADDRESS=
```

---

## Scripts

| Comando         | O que faz                |
| --------------- | ------------------------ |
| `pnpm dev`      | Sobe o ambiente completo |
| `pnpm dev:web`  | Apenas o frontend        |
| `pnpm dev:api`  | Apenas o backend         |
| `pnpm build`    | Build de produção        |
| `pnpm lint`     | Lint geral               |
| `pnpm test:api` | Testes do backend        |

---

## Deploy

- **Frontend** — Vercel
- **Backend** — Render, Railway, Fly.io ou similar
- **Banco** — Neon, Supabase ou outro PostgreSQL gerenciado
- **Storage** — Pinata / IPFS
- **Workflows** — Ambiente Chainlink CRE

---

## Branches

```
feature/* → develop → main
```

| Branch                  | Uso                           |
| ----------------------- | ----------------------------- |
| `main`                  | Versão estável para submissão |
| `develop`               | Integração                    |
| `feature/frontend`      | Frontend                      |
| `feature/backend-api`   | API                           |
| `feature/chainlink-cre` | Workflows CRE                 |

---

## Commits

```
feat: add patient dashboard layout
feat: add medical records API route
feat: add Chainlink CRE verification workflow
fix: update IPFS integration config
docs: update readme
chore: configure monorepo scaffold
```

---

## Licença

MIT
