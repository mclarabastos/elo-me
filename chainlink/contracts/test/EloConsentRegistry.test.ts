import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

async function deployRegistry() {
  const [owner, creForwarder, other, patient, clinic] = await ethers.getSigners();
  const Registry = await ethers.getContractFactory("EloConsentRegistry");
  const registry = await Registry.deploy(creForwarder.address);
  await registry.waitForDeployment();

  return { registry, owner, creForwarder, other, patient, clinic };
}

function hashString(value: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
}

describe("EloConsentRegistry", function () {
  const zeroHash = ethers.ZeroHash;
  const patientHash = hashString("patient_rose");
  const clinicHash = hashString("clinic_neurorio");
  const doctorHash = hashString("doctor_ana");
  const recordIdHash = hashString("data_allergies");
  const dataHash = hashString("metadata:data_allergies");
  const consentIdHash = hashString("consent_123");
  const scopesHash = hashString("allergies,medications");
  const accessIdHash = hashString("audit_123");
  const authorizedHash = hashString("AUTHORIZED");
  const requestedScopesHash = hashString("allergies,medications");

  describe("deploy", function () {
    it("deploys the contract", async function () {
      const { registry, creForwarder } = await deployRegistry();

      expect(await registry.getAddress()).to.properAddress;
      expect(await registry.cre_forwarder()).to.equal(creForwarder.address);
    });
  });

  describe("hashString", function () {
    it("matches ethers keccak256(toUtf8Bytes(value))", async function () {
      const { registry } = await deployRegistry();

      expect(await registry.hashString("patient_rose")).to.equal(patientHash);
    });
  });

  describe("registerMedicalRecordProof", function () {
    it("registers a medical data hash and emits an event", async function () {
      const { registry, owner } = await deployRegistry();

      await expect(
        registry.registerMedicalRecordProof(patientHash, recordIdHash, dataHash)
      )
        .to.emit(registry, "MedicalRecordProofRegistered")
        .withArgs(patientHash, recordIdHash, dataHash, owner.address, anyValue);

      const proof = await registry.medicalRecordProofs(recordIdHash);
      expect(proof.patientHash).to.equal(patientHash);
      expect(proof.recordIdHash).to.equal(recordIdHash);
      expect(proof.dataHash).to.equal(dataHash);
      expect(proof.exists).to.equal(true);
    });

    it("does not allow duplicate recordIdHash", async function () {
      const { registry } = await deployRegistry();

      await registry.registerMedicalRecordProof(
        patientHash,
        recordIdHash,
        dataHash
      );

      await expect(
        registry.registerMedicalRecordProof(patientHash, recordIdHash, dataHash)
      ).to.be.revertedWith("Record proof already registered");
    });

    it("does not accept bytes32 zero", async function () {
      const { registry } = await deployRegistry();

      await expect(
        registry.registerMedicalRecordProof(zeroHash, recordIdHash, dataHash)
      ).to.be.revertedWith("Invalid patient hash");
    });
  });

  describe("approveConsent", function () {
    it("approves consent, emits an event, and reports active", async function () {
      const { registry, owner } = await deployRegistry();
      const expiresAt = (await time.latest()) + 3600;

      await expect(
        registry.approveConsent(
          consentIdHash,
          patientHash,
          clinicHash,
          doctorHash,
          scopesHash,
          expiresAt
        )
      )
        .to.emit(registry, "ConsentApproved")
        .withArgs(
          consentIdHash,
          patientHash,
          clinicHash,
          doctorHash,
          scopesHash,
          expiresAt,
          owner.address,
          anyValue
        );

      expect(await registry.isConsentActive(consentIdHash)).to.equal(true);
    });

    it("does not allow expiresAt in the past", async function () {
      const { registry } = await deployRegistry();
      const expiresAt = (await time.latest()) - 1;

      await expect(
        registry.approveConsent(
          consentIdHash,
          patientHash,
          clinicHash,
          doctorHash,
          scopesHash,
          expiresAt
        )
      ).to.be.revertedWith("Consent must expire in future");
    });

    it("does not allow duplicate consentIdHash", async function () {
      const { registry } = await deployRegistry();
      const expiresAt = (await time.latest()) + 3600;

      await registry.approveConsent(
        consentIdHash,
        patientHash,
        clinicHash,
        doctorHash,
        scopesHash,
        expiresAt
      );

      await expect(
        registry.approveConsent(
          consentIdHash,
          patientHash,
          clinicHash,
          doctorHash,
          scopesHash,
          expiresAt
        )
      ).to.be.revertedWith("Consent already approved");
    });
  });

  describe("revokeConsent", function () {
    it("revokes consent and emits an event", async function () {
      const { registry, owner } = await deployRegistry();
      const expiresAt = (await time.latest()) + 3600;

      await registry.approveConsent(
        consentIdHash,
        patientHash,
        clinicHash,
        doctorHash,
        scopesHash,
        expiresAt
      );

      await expect(registry.revokeConsent(consentIdHash))
        .to.emit(registry, "ConsentRevoked")
        .withArgs(consentIdHash, patientHash, owner.address, anyValue);

      expect(await registry.isConsentActive(consentIdHash)).to.equal(false);
    });

    it("does not revoke missing consent", async function () {
      const { registry } = await deployRegistry();

      await expect(registry.revokeConsent(consentIdHash)).to.be.revertedWith(
        "Consent not found"
      );
    });
  });

  describe("registerAccessValidation", function () {
    async function approveBaseConsent() {
      const { registry, owner } = await deployRegistry();
      const expiresAt = (await time.latest()) + 3600;

      await registry.approveConsent(
        consentIdHash,
        patientHash,
        clinicHash,
        doctorHash,
        scopesHash,
        expiresAt
      );

      return { registry, owner };
    }

    it("registers AUTHORIZED access validation and emits an event", async function () {
      const { registry, owner } = await approveBaseConsent();

      await expect(
        registry.registerAccessValidation(
          accessIdHash,
          consentIdHash,
          authorizedHash,
          requestedScopesHash
        )
      )
        .to.emit(registry, "AccessValidated")
        .withArgs(
          accessIdHash,
          consentIdHash,
          authorizedHash,
          requestedScopesHash,
          owner.address,
          anyValue
        );

      const accessLog = await registry.accessValidationLogs(accessIdHash);
      expect(accessLog.decisionHash).to.equal(authorizedHash);
      expect(accessLog.exists).to.equal(true);
    });

    it("does not allow duplicate accessIdHash", async function () {
      const { registry } = await approveBaseConsent();

      await registry.registerAccessValidation(
        accessIdHash,
        consentIdHash,
        authorizedHash,
        requestedScopesHash
      );

      await expect(
        registry.registerAccessValidation(
          accessIdHash,
          consentIdHash,
          authorizedHash,
          requestedScopesHash
        )
      ).to.be.revertedWith("Access already registered");
    });

    it("does not register access log for missing consent", async function () {
      const { registry } = await deployRegistry();

      await expect(
        registry.registerAccessValidation(
          accessIdHash,
          consentIdHash,
          authorizedHash,
          requestedScopesHash
        )
      ).to.be.revertedWith("Consent not found");
    });
  });

  describe("privacy/security", function () {
    it("uses bytes32 hashes for core inputs instead of plaintext strings", async function () {
      const { registry } = await deployRegistry();

      const recordFunction = registry.interface.getFunction(
        "registerMedicalRecordProof"
      );
      const consentFunction = registry.interface.getFunction("approveConsent");
      const accessFunction = registry.interface.getFunction(
        "registerAccessValidation"
      );

      expect(recordFunction.inputs.map((input) => input.type)).to.deep.equal([
        "bytes32",
        "bytes32",
        "bytes32",
      ]);
      expect(consentFunction.inputs.map((input) => input.type)).to.deep.equal([
        "bytes32",
        "bytes32",
        "bytes32",
        "bytes32",
        "bytes32",
        "uint256",
      ]);
      expect(accessFunction.inputs.map((input) => input.type)).to.deep.equal([
        "bytes32",
        "bytes32",
        "bytes32",
        "bytes32",
      ]);
    });

    it("stores hashes in getters, not plaintext medical content", async function () {
      const { registry } = await deployRegistry();
      const expiresAt = (await time.latest()) + 3600;

      await registry.registerMedicalRecordProof(
        patientHash,
        recordIdHash,
        dataHash
      );
      await registry.approveConsent(
        consentIdHash,
        patientHash,
        clinicHash,
        doctorHash,
        scopesHash,
        expiresAt
      );

      const proof = await registry.medicalRecordProofs(recordIdHash);
      const consent = await registry.consents(consentIdHash);

      expect(proof.dataHash).to.equal(dataHash);
      expect(consent.scopesHash).to.equal(scopesHash);
    });
  });

  describe("CRE recordAccess compatibility", function () {
    it("records access when called by the CRE forwarder", async function () {
      const { registry, creForwarder, patient, clinic } = await deployRegistry();

      await expect(
        registry
          .connect(creForwarder)
          .recordAccess(
            patient.address,
            clinic.address,
            true,
            scopesHash,
            dataHash
          )
      )
        .to.emit(registry, "AccessRecorded")
        .withArgs(patient.address, clinic.address, true, scopesHash, anyValue);

      const log = await registry.accessLogs(patient.address, clinic.address);
      expect(log.clinic).to.equal(clinic.address);
      expect(log.scope).to.equal(scopesHash);
      expect(log.approved).to.equal(true);
      expect(log.documentHash).to.equal(dataHash);
    });

    it("rejects recordAccess from non-forwarder addresses", async function () {
      const { registry, other, patient, clinic } = await deployRegistry();

      await expect(
        registry
          .connect(other)
          .recordAccess(
            patient.address,
            clinic.address,
            true,
            scopesHash,
            dataHash
          )
      ).to.be.revertedWith("Only CRE forwarder");
    });

    it("getConsent returns true and expiry for approved access", async function () {
      const { registry, creForwarder, patient, clinic } = await deployRegistry();

      await registry
        .connect(creForwarder)
        .recordAccess(
          patient.address,
          clinic.address,
          true,
          scopesHash,
          dataHash
        );

      const log = await registry.accessLogs(patient.address, clinic.address);
      const [hasConsent, expiry] = await registry.getConsent(
        patient.address,
        clinic.address
      );

      expect(hasConsent).to.equal(true);
      expect(expiry).to.equal(log.timestamp + 24n * 60n * 60n);
    });

    it("getConsent returns false for patient and clinic without record", async function () {
      const { registry, patient, clinic } = await deployRegistry();

      const [hasConsent] = await registry.getConsent(
        patient.address,
        clinic.address
      );

      expect(hasConsent).to.equal(false);
    });
  });
});
