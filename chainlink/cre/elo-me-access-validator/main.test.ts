import { describe, expect } from "bun:test";
import { newTestRuntime, test } from "@chainlink/cre-sdk/test";
import { onCronTrigger, initWorkflow } from "./main";
import type { Config } from "./main";

const testConfig: Config = {
  validatorUrl: "https://elo-me.onrender.com/external/access/validate",
  clinicId: "clinic_neurorio",
  doctorId: "doctor_ana",
  consentId: "consent_4a5a94e7",
  requestedScopes: "allergies,medications",
  patientAddress: "0x1111111111111111111111111111111111111111",
  clinicAddress: "0x3333333333333333333333333333333333333333",
  contractAddress: "0x5eD86192F0521f35C8b93BD1D774Aa32ADA0E444",
  creForwarder: "0x5547E43EF39aD62668005aA861Db8556564cEc09",
  schedule: "*/30 * * * * *",
};

describe("initWorkflow", () => {
  test("returns one handler with correct cron schedule", async () => {
    const handlers = initWorkflow(testConfig);
    expect(handlers).toBeArray();
    expect(handlers).toHaveLength(1);
    expect(handlers[0].trigger.config.schedule).toBe(testConfig.schedule);
  });
});
