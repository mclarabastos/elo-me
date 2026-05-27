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

## Funções principais

- `registerMedicalRecordProof(bytes32 patientHash, bytes32 recordIdHash, bytes32 dataHash)`
- `approveConsent(bytes32 consentIdHash, bytes32 patientHash, bytes32 clinicHash, bytes32 doctorHash, bytes32 scopesHash, uint256 expiresAt)`
- `revokeConsent(bytes32 consentIdHash)`
- `registerAccessValidation(bytes32 accessIdHash, bytes32 consentIdHash, bytes32 decisionHash, bytes32 requestedScopesHash)`
- `isConsentActive(bytes32 consentIdHash)`
- `getConsent(bytes32 consentIdHash)`
- `hashString(string value)`

Os mappings públicos `medicalRecordProofs`, `consents` e `accessLogs` também geram getters automáticos.

## Eventos

- `MedicalRecordProofRegistered`
- `ConsentApproved`
- `ConsentRevoked`
- `AccessValidated`

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

Nunca commite `.env` real, private key, RPC privado ou qualquer segredo. O arquivo `.gitignore` local já ignora `.env`.

Se `PRIVATE_KEY` não existir, `compile` e `test` continuam funcionando. Deploy em testnet exige RPC e private key reais configurados localmente.

## Escolha de rede para hackathon

- Sepolia é simples para validação EVM geral.
- Arbitrum Sepolia pode ser usada se o time quiser se aproximar de ecossistema L2/EVM.
- O backend já é agnóstico; precisa apenas salvar `contract_address`, `chain_id` e `transaction_hash` futuramente.

## Como o contrato conversa com o backend

1. Backend gera `data_hash`.
2. Backend/frontend chama `registerMedicalRecordProof`.
3. Backend/frontend chama `approveConsent`.
4. CRE/backend chama a validação externa `/external/access/validate`.
5. Depois registra `registerAccessValidation`.
6. Backend salva `transaction_hash` retornado.

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
5. Fazer deploy com `npm run deploy:sepolia` ou `npm run deploy:arbitrum-sepolia`.
6. Salvar endereço do contrato em variável de ambiente do backend.
7. Integrar o backend para registrar hashes, consentimentos e auditorias no contrato.
8. Conectar o fluxo com Chainlink CRE real.
