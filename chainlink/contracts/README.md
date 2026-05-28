# EloConsentRegistry

`EloConsentRegistry` é o registro verificável do Elo.me. Ele funciona como um cartório on-chain para provas, consentimentos e eventos de auditoria relacionados ao fluxo de acesso médico do MVP.

O contrato **não armazena dados médicos reais**. O backend/off-chain guarda os dados reais e a API externa simulada para Chainlink CRE decide se um acesso é autorizado. O contrato registra apenas hashes, status e eventos verificáveis.

## O que vai on-chain

- hashes de paciente, clínica, médica, consentimento e escopos;
- hash do dado/documento médico;
- status de consentimento;
- eventos de auditoria.

## O que não vai on-chain

- prontuário real;
- nome completo;
- CPF;
- diagnóstico;
- laudo;
- alergias em texto aberto;
- medicamentos em texto aberto;
- payload criptografado.

## Exemplos de strings que viram hash

Essas strings devem ser transformadas off-chain ou pela função auxiliar `hashString`:

- `patient_rose`
- `clinic_neurorio`
- `doctor_ana`
- `consent_123`
- `allergies,medications`
- `AUTHORIZED`
- `DENIED`

Exemplo:

```solidity
bytes32 patientHash = registry.hashString("patient_rose");
```

## Fluxo esperado

1. Backend cria dado médico e gera `data_hash`.
2. Contrato registra `dataHash` com `registerMedicalRecordProof`.
3. Backend cria consentimento seletivo.
4. Contrato registra consentimento aprovado com `approveConsent`.
5. CRE/backend valida acesso pela API externa.
6. Contrato registra `AccessValidated` com `registerAccessValidation`.
7. Se paciente revoga, contrato registra `ConsentRevoked` com `revokeConsent`.

## Fluxo compatível com Chainlink CRE

A integração da Isa usa duas chamadas principais:

- EVM Read: `getConsent(address patient, address clinic)`
- EVM Write: `recordAccess(address patient, address clinic, bool approved, bytes32 scope, bytes32 documentHash)`

`recordAccess` só pode ser chamada pelo endereço `cre_forwarder`, definido no deploy. Essa função salva um `AccessLog` por paciente e clínica em `accessLogs[patient][clinic]`, sem gravar dados sensíveis em texto aberto.

`getConsent(address patient, address clinic)` retorna:

- `hasConsent`: o último status aprovado/negado registrado para aquele par paciente-clínica;
- `expiry`: `timestamp + 24 hours` do log registrado.

## Funções principais

- `registerMedicalRecordProof(bytes32 patientHash, bytes32 recordIdHash, bytes32 dataHash)`
- `approveConsent(bytes32 consentIdHash, bytes32 patientHash, bytes32 clinicHash, bytes32 doctorHash, bytes32 scopesHash, uint256 expiresAt)`
- `revokeConsent(bytes32 consentIdHash)`
- `registerAccessValidation(bytes32 accessIdHash, bytes32 consentIdHash, bytes32 decisionHash, bytes32 requestedScopesHash)`
- `isConsentActive(bytes32 consentIdHash)`
- `getConsentById(bytes32 consentIdHash)`
- `getConsent(address patient, address clinic)`
- `recordAccess(address patient, address clinic, bool approved, bytes32 scope, bytes32 documentHash)`
- `hashString(string value)`

Os mappings públicos `medicalRecordProofs`, `consents` e `accessLogs` também geram getters automáticos.

## Eventos

- `MedicalRecordProofRegistered`
- `ConsentApproved`
- `ConsentRevoked`
- `AccessValidated`
- `AccessRecorded`

Esses eventos são a base para auditoria e demonstração no pitch.

## Desenvolvimento com Hardhat

Instalar dependências:

```powershell
npm install
```

Compilar:

```powershell
npm run compile
```

Testar:

```powershell
npm test
```

Deploy local:

```powershell
npm run deploy:local
```

Deploy Sepolia:

```powershell
npm run deploy:sepolia
```

Deploy Arbitrum Sepolia:

```powershell
npm run deploy:arbitrum-sepolia
```

## Deploy atual em Arbitrum Sepolia

O contrato `EloConsentRegistry` já foi publicado em testnet para apoiar a integração futura com Chainlink CRE e o pitch.

| Campo | Valor |
| --- | --- |
| Network | `arbitrumSepolia` |
| Chain ID | `421614` |
| Contract address | `0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444` |
| Deployer | `0x5547E43EF39aD62668005aA861Db8556564cEc09` |
| CRE forwarder usado no deploy | `0x5547E43EF39aD62668005aA861Db8556564cEc09` |
| Explorer | `https://sepolia.arbiscan.io/address/0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444` |

Esse deploy não coloca dados médicos on-chain. Ele registra apenas hashes, endereços técnicos, status e eventos. O endereço do deploy pode ser usado no backend por variáveis opcionais, sem obrigar chamadas reais à blockchain durante o modo demo/mock.

## Variáveis de ambiente

Copie `.env.example` para `.env` apenas localmente:

```powershell
cp .env.example .env
```

Variáveis esperadas:

- `SEPOLIA_RPC_URL`
- `ARBITRUM_SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `ETHERSCAN_API_KEY`
- `ARBISCAN_API_KEY`
- `CRE_FORWARDER_ADDRESS`

Nunca commite `.env` real, private key, RPC privado ou qualquer segredo. O arquivo `.gitignore` local já ignora `.env`.

Se `PRIVATE_KEY` não existir, `compile` e `test` continuam funcionando. Deploy em testnet exige RPC e private key reais configurados localmente.

Se `CRE_FORWARDER_ADDRESS` não existir, o script de deploy usa o endereço do deployer como fallback local/demo. Em testnet, configure o endereço real do forwarder usado pelo Chainlink CRE.

## Escolha de rede para hackathon

- Sepolia é simples para validação EVM geral.
- Arbitrum Sepolia pode ser usada se o time quiser se aproximar de ecossistema L2/EVM.
- O backend já é agnóstico; precisa apenas salvar `contract_address`, `chain_id` e `transaction_hash` futuramente.

## Como o contrato conversa com o backend

1. Backend gera `data_hash`.
2. Backend/frontend chama `registerMedicalRecordProof`.
3. Backend/frontend chama `approveConsent`.
4. CRE/backend chama a validação externa `/external/access/validate`.
5. CRE pode chamar `getConsent(address patient, address clinic)` via EVM Read.
6. CRE registra `recordAccess` via EVM Write usando o forwarder autorizado.
7. Backend pode registrar auditoria legada com `registerAccessValidation`.
8. Backend salva `transaction_hash` retornado.

## Observações de segurança

- O contrato é permissionless nesta versão de hackathon.
- Nenhum dado médico sensível deve ser enviado para as funções.
- `patientHash`, `clinicHash`, `doctorHash`, `recordIdHash`, `consentIdHash` e `scopesHash` devem ser gerados a partir de identificadores técnicos.
- `scopesHash` deve representar os escopos autorizados, por exemplo hash de `allergies,medications`, sem armazenar a lista textual.
- `decisionHash` deve representar decisões como hash de `AUTHORIZED` ou `DENIED`.
- O backend e o Chainlink CRE continuam responsáveis pela lógica de autorização real nesta fase.

## Próximos passos para deploy em testnet

1. Instalar dependências com `npm install`.
2. Rodar `npm run compile`.
3. Rodar `npm test`.
4. Configurar `.env` local com RPC e private key de testnet.
5. Configurar `CRE_FORWARDER_ADDRESS` com o forwarder real do Chainlink CRE.
6. Fazer deploy com `npm run deploy:sepolia` ou `npm run deploy:arbitrum-sepolia`.
7. Salvar endereço do contrato em variável de ambiente do backend.
8. Integrar o backend para registrar hashes, consentimentos e auditorias no contrato.
9. Conectar o fluxo com Chainlink CRE real.
