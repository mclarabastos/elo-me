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

## Como compilar futuramente

Ainda não há um projeto Hardhat ou Foundry configurado nesta pasta. Para manter a etapa mínima e sem dependências externas, o contrato foi escrito de forma independente.

Opções para compilar depois:

### Remix

1. Abrir [Remix](https://remix.ethereum.org/).
2. Criar arquivo `EloConsentRegistry.sol`.
3. Colar o conteúdo de `src/EloConsentRegistry.sol`.
4. Selecionar compilador Solidity `0.8.24` ou compatível.
5. Compilar e fazer deploy em testnet.

### Hardhat

Futuramente, dentro de `chainlink/contracts`, criar configuração mínima:

```powershell
npm init -y
npm install --save-dev hardhat
npx hardhat init
npx hardhat compile
```

### Foundry

Futuramente, dentro de `chainlink/contracts`, criar configuração mínima:

```powershell
forge init --no-git
forge build
```

## Observações de segurança

- O contrato é permissionless nesta versão de hackathon.
- Nenhum dado médico sensível deve ser enviado para as funções.
- `patientHash`, `clinicHash`, `doctorHash`, `recordIdHash`, `consentIdHash` e `scopesHash` devem ser gerados a partir de identificadores técnicos.
- `scopesHash` deve representar os escopos autorizados, por exemplo hash de `allergies,medications`, sem armazenar a lista textual.
- `decisionHash` deve representar decisões como hash de `AUTHORIZED` ou `DENIED`.
- O backend e o Chainlink CRE continuam responsáveis pela lógica de autorização real nesta fase.

## Próximos passos para deploy em testnet

1. Escolher rede de teste compatível com o pitch.
2. Configurar Hardhat ou Foundry dentro de `chainlink/contracts`.
3. Criar script de deploy.
4. Fazer deploy do `EloConsentRegistry`.
5. Salvar endereço do contrato em variável de ambiente do backend.
6. Integrar o backend para registrar hashes, consentimentos e auditorias no contrato.
7. Conectar o fluxo com Chainlink CRE real.
