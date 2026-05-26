# Elo.me

Uma plataforma para gestão, compartilhamento e verificação de históricos médicos, conectando pacientes, médicos e clínicas em uma experiência digital segura e interoperável.

A plataforma combina:

- uma aplicação web para acesso e gestão de registros médicos;
- uma área autenticada para pacientes, médicos e clínicas;
- uma API para prontuários, permissões, usuários e integrações externas;
- armazenamento de referências e metadados via IPFS/Pinata;
- workflows Chainlink CRE para validação, automação e orquestração entre APIs externas, dados offchain e possíveis interações onchain.

O projeto está estruturado como um monorepo com frontend em Next.js, backend em FastAPI, design system compartilhado, infraestrutura IPFS e workflows Chainlink CRE.

---

## Arquitetura em Alto Nível

| Camada               | Tecnologia                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Frontend**         | Next.js App Router + React + TypeScript + Tailwind CSS + shadcn/ui                                  |
| **API**              | FastAPI + Python, organizada por rotas versionadas e camada de serviços                             |
| **Dados**            | PostgreSQL via SQLAlchemy                                                                           |
| **Armazenamento**    | IPFS/Pinata para arquivos, CIDs e metadados associados aos registros                                |
| **Workflows Oracle** | Chainlink CRE para triggers, chamadas HTTP, secrets, validações offchain e possíveis interações EVM |
| **Blockchain**       | Integração EVM opcional, conforme escopo final do MVP                                               |
| **Deploy**           | Frontend em Vercel, backend FastAPI em serviço cloud compatível e banco PostgreSQL gerenciado       |

---

## Domínios Principais

- **Registros Médicos** — criação, organização, consulta e rastreabilidade de registros médicos
- **Permissões de Acesso** — controle de acesso entre pacientes, médicos e clínicas
- **Pacientes** — visualização de histórico médico e gestão de permissões
- **Médicos** — acesso a pacientes autorizados e registros disponíveis
- **Clínicas** — gestão de médicos, pacientes, documentos e configurações operacionais
- **Armazenamento IPFS** — armazenamento ou referência de documentos e metadados verificáveis
- **Chainlink CRE** — workflows para validação, automação e comunicação com dados externos
- **Design System** — tokens visuais, estilos globais e componentes reutilizáveis

---

## Estrutura do Repositório

```txt
.
├── apps/web                  # Frontend Next.js
├── services/api              # Backend FastAPI
├── packages/design-system    # Tokens, estilos e componentes reutilizáveis
├── chainlink/cre             # Workflows Chainlink CRE
├── chainlink/contracts       # Contratos opcionais
├── infra/ipfs                # Configuração IPFS/Pinata
├── docs                      # Documentação técnica
└── .github                   # Templates de PR e issues
```

---

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Git
- PostgreSQL local ou remoto
- Conta Pinata para fluxos IPFS
- Ferramentas Chainlink CRE para implementação e testes dos workflows
- RPC EVM e credenciais de carteira (apenas se o MVP incluir interações onchain)

---

## Início Rápido

### Instalar dependências

```bash
pnpm install
```

### Configurar ambiente

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### Iniciar desenvolvimento do frontend

```bash
pnpm dev:web
```

### Iniciar desenvolvimento do backend

```bash
cd services/api
python -m venv .venv
```

No Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Instalar dependências do backend:

```bash
pip install -r requirements.txt
```

Rodar a API:

```bash
uvicorn app.main:app --reload
```

---

## Stack Local Completa

A stack local completa é planejada para incluir:

- Aplicação web Next.js
- Backend FastAPI
- Banco PostgreSQL
- Integração IPFS/Pinata
- Simulações de workflows Chainlink CRE

Comando planejado:

```bash
pnpm dev
```

---

## Variáveis de Ambiente

Use `.env.example` como fonte de referência.

### Configuração pública do cliente

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

### Configuração do servidor

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
```

### Configuração IPFS/Pinata

```env
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
PINATA_GATEWAY_URL=
```

### Configuração Chainlink e Web3

```env
CHAINLINK_CRE_ENV=
RPC_URL=
PRIVATE_KEY=
CHAIN_ID=
CONTRACT_ADDRESS=
```

> **Nunca commite secrets reais no `.env`.**

---

## Scripts Disponíveis

| Comando          | Descrição                                |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Inicia o fluxo padrão de desenvolvimento |
| `pnpm dev:web`   | Inicia a aplicação web Next.js           |
| `pnpm dev:api`   | Inicia o backend FastAPI localmente      |
| `pnpm build`     | Executa o fluxo de build de produção     |
| `pnpm build:web` | Gera o build da aplicação web            |
| `pnpm lint`      | Executa o lint padrão                    |
| `pnpm lint:web`  | Executa o lint da aplicação web          |
| `pnpm test:api`  | Executa os testes do backend             |

---

## Deploy

| Camada             | Opções recomendadas                                            |
| ------------------ | -------------------------------------------------------------- |
| **Frontend**       | Vercel ou qualquer plataforma compatível com Next.js           |
| **Backend**        | Render, Railway, Fly.io, AWS, GCP ou Azure                     |
| **Banco de dados** | Neon, Supabase, Railway, Render ou outro PostgreSQL gerenciado |
| **Storage**        | Pinata / IPFS                                                  |
| **Workflows**      | Ambiente Chainlink CRE, conforme escopo final do hackathon     |

### Etapas de deploy

1. Importar o repositório no provedor de deploy.
2. Configurar as variáveis de ambiente com base no `.env.example`.
3. Configurar uma `DATABASE_URL` de produção.
4. Configurar credenciais Pinata para fluxos IPFS.
5. Configurar variáveis Chainlink/Web3, caso os workflows precisem de acesso à rede.
6. Realizar deploy do frontend e backend conforme seus respectivos runtimes.

---

## Banco de Dados

| Item                | Localização                |
| ------------------- | -------------------------- |
| Models              | `services/api/app/models`  |
| Schemas Pydantic    | `services/api/app/schemas` |
| Sessão e migrations | `services/api/app/db`      |

### Entidades iniciais

- `users`
- `patients`
- `doctors`
- `clinics`
- `medical records`
- `access permissions`
- `IPFS metadata references`
- `Chainlink workflow execution records` _(se necessário)_

---

## Chainlink CRE

Chainlink CRE será usado como camada de orquestração de workflows para operações que exigem dados externos, computação offchain, secrets, triggers, leituras/escritas EVM ou execução verificável.

### Áreas iniciais de workflow

- Verificação de registros médicos
- Permissão de acesso
- Validação acionada por HTTP
- Automação acionada por cron
- Fluxos opcionais acionados por eventos EVM

### Modelo de workflow

```
Trigger
  ↓
Executa lógica offchain
  ↓
Lê backend API / IPFS / fonte externa
  ↓
Valida payload, hash, CID ou metadados de permissão
  ↓
Retorna resultado verificável ou escreve onchain
```

---

## IPFS e Pinata

IPFS/Pinata será usado para armazenar ou referenciar arquivos e metadados relacionados a registros médicos.

### Responsabilidades esperadas

- Fazer upload de arquivos ou metadados para IPFS
- Persistir os CIDs retornados
- Associar CIDs a registros médicos
- Validar referências armazenadas durante workflows CRE
- Manter credenciais sensíveis no server-side

---

## Qualidade e CI

- `pnpm build` deve passar antes de merge na `main`
- `pnpm lint` deve passar antes de merge na `main`
- Testes do backend devem passar antes de merge de alterações na API
- Mudanças em variáveis de ambiente devem ser documentadas no `.env.example`
- Mudanças de banco devem incluir notas de migration
- Mudanças em workflows devem incluir notas sobre triggers, secrets e ambiente de execução esperado

---

## Segurança

- Nunca commite secrets no `.env`
- Trate private keys como secrets de produção
- Mantenha credenciais Pinata preferencialmente no server-side
- Restrinja acesso a registros médicos por permissão e papel de usuário
- Valide payloads externos antes de armazenar ou processar dados
- Não exponha dados sensíveis de pacientes em rotas públicas
- Qualquer escrita onchain deve ser protegida por validação e controle de acesso

---

## Modelo de Branches

| Branch                  | Propósito                                                      |
| ----------------------- | -------------------------------------------------------------- |
| `main`                  | Branch estável para versões revisadas e prontas para submissão |
| `develop`               | Branch de integração para desenvolvimento                      |
| `feature/frontend`      | Implementação do frontend                                      |
| `feature/backend-api`   | Implementação da API backend                                   |
| `feature/chainlink-cre` | Implementação dos workflows Chainlink CRE                      |

### Fluxo recomendado

```
feature/* → develop → main
```

---

## Contribuição

1. Crie uma branch a partir da feature apropriada ou da `develop`.
2. Mantenha alterações pequenas e fáceis de revisar.
3. Valide localmente antes de abrir um pull request.
4. Abra pull requests para `develop`, não diretamente para `main`.
5. Inclua observações quando mudanças afetarem variáveis de ambiente, banco de dados, contratos de API ou workflows Chainlink.
6. Use mensagens de commit claras.

### Exemplos de commits

```
feat: add patient dashboard layout
feat: add medical records API route
feat: add Chainlink CRE record verification workflow
fix: update IPFS integration config
docs: update architecture documentation
chore: configure monorepo scaffold
```

---

## Licença

MIT
