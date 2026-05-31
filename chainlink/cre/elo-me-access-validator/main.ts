import {
  consensusIdenticalAggregation,
  cre,
  type HTTPSendRequester,
  json,
  Runner,
  type Runtime,
} from "@chainlink/cre-sdk";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface Config {
  validatorUrl: string;
  clinicId: string;
  doctorId: string;
  consentId: string;
  requestedScopes: string;
  patientAddress: string;
  clinicAddress: string;
  contractAddress: string;
  creForwarder: string;
  schedule: string;
}

// ─── Resposta do backend de validação ────────────────────────────────────────

interface ConsentResponse {
  decision: "AUTHORIZED" | "DENIED";
  reason: string;
  validatedBy: string;
  clinicAuthorized: boolean;
  doctorAuthorized: boolean;
  doctorBelongsToClinic: boolean;
  consentValid: boolean;
  scopeValid: boolean;
  requestedScopes: string[];
  allowedScopes: string[];
}

// ─── Fetch function — roda em cada nó do DON ─────────────────────────────────

// Chamada via HTTPClient com consenso DON (consensusIdenticalAggregation).
const fetchConsentStatus = (
  sendRequester: HTTPSendRequester,
  config: Config
): string => {
  const response = sendRequester
    .sendRequest({
      url: `${config.validatorUrl}?clinic_id=${config.clinicId}&doctor_id=${config.doctorId}&consent_id=${config.consentId}&requested_scopes=${config.requestedScopes}`,
      method: "GET",
    })
    .result();

  if (response.statusCode !== 200) {
    throw new Error(`[Elo.me] Backend error: ${response.statusCode}`);
  }

  const data = json(response) as ConsentResponse;
  return data.decision; // "AUTHORIZED" ou "DENIED"
};

// ─── Workflow handler ─────────────────────────────────────────────────────────

export const onCronTrigger = (
  runtime: Runtime<Config>,
  _payload: unknown
): string => {
  const { contractAddress, patientAddress, clinicAddress, clinicId, consentId } =
    runtime.config;

  runtime.log(
    `[Elo.me] Verificando clínica ID: ${clinicId} / consent: ${consentId}`
  );

  // STEP 1: HTTP → backend via HTTPClient com consenso DON
  // Cada nó do DON faz a chamada independentemente; o consenso garante a decisão.
  const httpClient = new cre.capabilities.HTTPClient();
  const decision = httpClient
    .sendRequest(runtime, fetchConsentStatus, consensusIdenticalAggregation<string>())
    (runtime.config)
    .result();

  const approved = decision === "AUTHORIZED";
  runtime.log(`[Elo.me] Decisão: ${approved ? "APPROVED" : "DENIED"}`);

  // STEP 2: Compor o resultado auditável.
  // Na execução real do DON, a infraestrutura CRE (forwarder) escreve
  // este output on-chain no EloConsentRegistry (Arbitrum Sepolia).
  const result = {
    workflow: "elo-me-access-validator",
    decision: approved ? "APPROVED" : "DENIED",
    clinicId,
    consentId,
    clinicAddress,
    patientAddress,
    contractAddress,
    network: "arbitrum-sepolia",
    timestamp: runtime.now().toISOString(),
    reason: approved
      ? "Clínica verificada e consentimento ativo"
      : "Acesso negado — consentimento ausente ou escopo inválido",
  };

  runtime.log(`[Elo.me] ${JSON.stringify(result)}`);
  return JSON.stringify(result);
};

// ─── Init workflow ────────────────────────────────────────────────────────────

export const initWorkflow = (config: Config) => {
  const cron = new cre.capabilities.CronCapability();
  return [cre.handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)];
};

// ─── Runner (simulação local) ─────────────────────────────────────────────────

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
