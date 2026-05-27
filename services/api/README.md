# Elo.me API

Backend FastAPI do Elo.me, responsável por gerenciar identidade demo do paciente, clínicas, médicos, dados médicos com hash, solicitações de acesso, consentimentos seletivos, validação externa para Chainlink CRE e logs de auditoria.

## 1. Visão geral

O backend simula a camada off-chain do Elo.me para o MVP da hackathon. Ele organiza o fluxo de acesso a dados médicos de uma paciente demo, mantendo a regra principal do produto: dados sensíveis não devem ser expostos livremente.

Na API, os dados médicos retornam metadados e hashes. O payload sensível existe apenas internamente e não aparece nas respostas públicas. Quando há consentimento ativo, a API libera somente as categorias autorizadas pela paciente.

A rota externa em `/external` simula a API que o Chainlink CRE poderá consultar para validar clínica, médica, vínculo médica-clínica, consentimento e escopos. Toda tentativa de validação de acesso, autorizada ou negada, gera log de auditoria.

## 2. Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite local para demo
- Pydantic v2
- Pytest
- Uvicorn

## 3. Como rodar localmente no Windows PowerShell

Entre na pasta da API:

```powershell
cd C:\Users\KODIE\Documents\hackathon\elo-me\services\api
```

Crie o ambiente virtual:

```powershell
python -m venv .venv
```

Caso o PowerShell bloqueie a ativação:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\Activate.ps1
```

Instale as dependências:

```powershell
pip install -r requirements.txt
```

Rode a API:

```powershell
uvicorn app.main:app --reload
```

Abra a documentação Swagger:

```text
http://127.0.0.1:8000/docs
```

Rode os testes:

```powershell
pytest
```

## Deploy

### Render

Passos sugeridos para publicar o backend no Render:

1. Criar conta no Render.
2. Criar um Web Service conectado ao GitHub.
3. Selecionar o repositório `elo-me`.
4. Definir Root Directory como `services/api`.
5. Definir Build Command:

```powershell
pip install -r requirements.txt
```

6. Definir Start Command:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

7. Configurar env vars:

```text
APP_ENV=production
DEBUG=false
DATABASE_URL=sqlite:///./elome.db
SECRET_KEY=<gerar valor seguro>
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=<url do front quando existir>
```

8. Após o deploy, testar:

```text
/health
/docs
/demo/overview
```

SQLite é aceitável para MVP/demo, mas em produção real deve migrar para PostgreSQL. A URL pública do backend será usada pelo frontend e pelo Chainlink CRE. Quando o frontend estiver publicado, a URL dele precisa entrar em `BACKEND_CORS_ORIGINS`.

Este diretório também inclui `Procfile`, `runtime.txt`, `.env.example` e `render.yaml` para facilitar deploy. Se o Render exigir `render.yaml` na raiz do repo futuramente, isso deve ser feito em uma etapa separada para evitar mexer no monorepo agora.

### Railway/Fly.io

Também é possível usar Railway ou Fly.io usando o mesmo start command:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## URL pública para Clara e Isa

Depois do deploy, compartilhar com a equipe:

Backend base URL:

```text
https://sua-url.onrender.com
```

Rotas úteis:

```text
https://sua-url.onrender.com/health
https://sua-url.onrender.com/docs
https://sua-url.onrender.com/demo/overview
https://sua-url.onrender.com/external/access/validate
```

## 4. Status atual dos testes

O backend atualmente possui testes automatizados para health, usuário demo, dados demo, access requests, consents, authorized medical data, external CRE API, audit logs e demo routes.

Todos os testes precisam continuar passando antes de cada commit. As datas do backend usam datetime UTC timezone-aware para reduzir warnings e preparar o deploy.

## 5. Fluxo principal do MVP

1. Paciente demo existe no sistema.
2. Clínica e médica demo existem no sistema.
3. Dados médicos demo existem, mas o payload sensível não é exposto.
4. Clínica solicita acesso a categorias do prontuário.
5. Paciente aprova apenas alguns escopos.
6. Consentimento ativo é criado.
7. Validação externa verifica clínica, médica, consentimento e escopos.
8. Se autorizado, a API libera apenas os dados permitidos.
9. Se pedir algo fora do consentimento, a API nega.
10. Toda tentativa gera log de auditoria.

## 6. Entidades principais

### User

Campos principais:

- `id`
- `name`
- `email`
- `role`
- `wallet_address`

### Clinic

Campos principais:

- `id`
- `name`
- `cnpj`
- `authorized`
- `license_status`
- `risk_level`

### Doctor

Campos principais:

- `id`
- `name`
- `crm`
- `authorized`
- `crm_status`
- `clinic_id`

### MedicalData

Campos principais:

- `id`
- `patient_id`
- `category`
- `label`
- `data_hash`
- `sensitivity`

`encrypted_payload` existe internamente, mas não deve ser exposto nas respostas.

### AccessRequest

Campos principais:

- `id`
- `patient_id`
- `clinic_id`
- `doctor_id`
- `requested_scopes`
- `purpose`
- `duration_hours`
- `status`

### Consent

Campos principais:

- `id`
- `access_request_id`
- `patient_id`
- `allowed_scopes`
- `expires_at`
- `status`
- `transaction_hash`

### AuditLog

Campos principais:

- `id`
- `patient_id`
- `clinic_id`
- `doctor_id`
- `consent_id`
- `requested_scopes`
- `decision`
- `reason`
- `validated_by`
- `created_at`

## 7. Endpoints principais

| Método | Rota | Uso | Consumidor principal |
| --- | --- | --- | --- |
| GET | `/health` | Verificar se API está viva | dev/equipe |
| GET | `/users/demo` | Obter/criar paciente demo | frontend |
| GET | `/clinics/demo` | Obter/criar clínica demo | frontend/demo |
| GET | `/doctors/demo` | Obter/criar médica demo | frontend/demo |
| GET | `/patients/patient_rose/medical-data` | Listar metadados/hash dos dados médicos | frontend |
| POST | `/access-requests` | Criar solicitação de acesso | frontend |
| GET | `/access-requests/{request_id}` | Buscar solicitação | frontend |
| PATCH | `/access-requests/{request_id}/status` | Atualizar status da solicitação | frontend/backend |
| GET | `/patients/{patient_id}/access-requests` | Listar solicitações do paciente | frontend |
| POST | `/consents/approve` | Aprovar consentimento seletivo | frontend |
| POST | `/consents/revoke` | Revogar consentimento | frontend |
| GET | `/consents/{consent_id}` | Buscar consentimento | frontend/backend |
| GET | `/consents/{consent_id}/verify` | Verificar validade de consentimento | backend/CRE |
| GET | `/consents/{consent_id}/authorized-medical-data` | Retornar dados autorizados por escopo | frontend |
| GET | `/external/clinics/{clinic_id}/verify` | API externa simulada de validação de clínica | Chainlink CRE |
| GET | `/external/doctors/{doctor_id}/verify` | API externa simulada de validação de médica | Chainlink CRE |
| GET | `/external/consents/{consent_id}/verify` | API externa simulada de consentimento | Chainlink CRE |
| GET | `/external/access/validate` | Valida acesso e cria log de auditoria | Chainlink CRE |
| GET | `/audit-logs` | Listar logs | frontend/admin/pitch |
| GET | `/audit-logs/{audit_log_id}` | Buscar log específico | frontend/admin/pitch |
| GET | `/patients/{patient_id}/audit-logs` | Listar logs do paciente | frontend/paciente |
| GET | `/demo/overview` | Resumo pronto para dashboard/pitch | frontend/pitch |
| POST | `/demo/run-authorized-flow` | Executar fluxo autorizado completo | frontend/pitch |
| POST | `/demo/run-denied-flow` | Executar fluxo negado completo | frontend/pitch |
| POST | `/demo/reset-local-demo-data` | Limpar dados gerados de demo | equipe/dev |

## 8. Endpoints recomendados para a Clara consumir no frontend

Para dashboard:

- `GET /demo/overview`

Para botão "Simular acesso autorizado":

- `POST /demo/run-authorized-flow`

Para botão "Simular acesso negado":

- `POST /demo/run-denied-flow`

Para limpar demo antes do pitch:

- `POST /demo/reset-local-demo-data`

Para tela de auditoria:

- `GET /patients/patient_rose/audit-logs`

Para tela de dados médicos:

- `GET /patients/patient_rose/medical-data`

Para fluxo manual:

- `POST /access-requests`
- `POST /consents/approve`
- `GET /consents/{consent_id}/authorized-medical-data`

## 9. Endpoint recomendado para a Isa usar no Chainlink CRE

Endpoint principal:

```http
GET /external/access/validate
```

Exemplo de chamada:

```text
/external/access/validate?clinic_id=clinic_neurorio&doctor_id=doctor_ana&consent_id=consent_5799c09c&requested_scopes=allergies,medications
```

Esse endpoint simula uma API externa que o CRE pode consultar. Ele valida clínica, médica, vínculo médica-clínica, consentimento e escopos. A resposta informa `AUTHORIZED` ou `DENIED` e também cria um log de auditoria.

Exemplo de retorno autorizado:

```json
{
  "decision": "AUTHORIZED",
  "reason": "Access granted by valid consent",
  "validatedBy": "external-api-for-chainlink-cre",
  "clinicAuthorized": true,
  "doctorAuthorized": true,
  "doctorBelongsToClinic": true,
  "consentValid": true,
  "scopeValid": true,
  "requestedScopes": ["allergies", "medications"],
  "allowedScopes": ["allergies", "medications"]
}
```

Exemplo de retorno negado:

```json
{
  "decision": "DENIED",
  "reason": "Requested scopes are outside consent",
  "scopeValid": false,
  "requestedScopes": ["allergies", "recent_exams"],
  "allowedScopes": ["allergies", "medications"]
}
```

## 10. Fluxo de demo para o pitch

1. Abrir dashboard no frontend.
2. Mostrar paciente Roseane e categorias médicas disponíveis.
3. Clicar em fluxo autorizado.
4. Mostrar que apenas alergias e medicamentos são liberados.
5. Clicar em fluxo negado.
6. Mostrar que exames recentes foram bloqueados porque não estavam no consentimento.
7. Mostrar logs de auditoria.
8. Explicar que o Chainlink CRE usa a API externa para validar a regra antes de liberar o acesso.

## 11. O que ainda é mock/demo

- Blockchain real ainda não integrada.
- Chainlink CRE real ainda não integrado.
- IPFS/Pinata real ainda não integrado.
- Autenticação real ainda não implementada.
- Criptografia real do payload ainda está simulada.
- ZK Proofs ficam como roadmap.
- Banco local SQLite é para MVP/demo.

## 12. Próximos passos técnicos

1. Integrar frontend aos endpoints `/demo`.
2. Publicar backend em Render/Railway/Fly.io.
3. Expor URL pública para o Chainlink CRE consultar.
4. Criar workflow CRE chamando `/external/access/validate`.
5. Adicionar smart contract/testnet para registrar consentimento/hash/auditoria.
6. Trocar SQLite por PostgreSQL em deploy.
7. Integrar IPFS/Pinata.
8. Evoluir validações de timezone conforme o banco de produção exigir.

## 13. Comandos úteis de Git

```powershell
git status
git add services/api
git commit -m "docs: add backend API documentation"
git push
```

Antes de commitar, sempre rodar:

```powershell
cd services/api
pytest
```

## 14. Observações para hackathon

Este backend já sustenta uma narrativa clara para HackaNation:

- aplicabilidade real em saúde;
- privacidade seletiva;
- consentimento verificável;
- integração com API externa para Chainlink CRE;
- auditoria de acessos;
- endpoints de demo para frontend e pitch.
