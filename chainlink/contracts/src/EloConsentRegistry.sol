// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title EloConsentRegistry
/// @notice Verifiable registry for Elo.me hashes, consents, and audit events.
/// @dev This contract must never receive plaintext medical data.
contract EloConsentRegistry {
    address public cre_forwarder;

    struct MedicalRecordProof {
        bytes32 patientHash;
        bytes32 recordIdHash;
        bytes32 dataHash;
        uint256 registeredAt;
        address registeredBy;
        bool exists;
    }

    struct Consent {
        bytes32 consentIdHash;
        bytes32 patientHash;
        bytes32 clinicHash;
        bytes32 doctorHash;
        bytes32 scopesHash;
        uint256 expiresAt;
        uint256 approvedAt;
        address approvedBy;
        bool active;
        bool exists;
    }

    struct AccessValidationLog {
        bytes32 accessIdHash;
        bytes32 consentIdHash;
        bytes32 decisionHash;
        bytes32 requestedScopesHash;
        uint256 createdAt;
        address registeredBy;
        bool exists;
    }

    struct AccessLog {
        address clinic;
        bytes32 scope;
        bool approved;
        uint256 timestamp;
        bytes32 documentHash;
    }

    mapping(bytes32 => MedicalRecordProof) public medicalRecordProofs;
    mapping(bytes32 => Consent) public consents;
    mapping(bytes32 => AccessValidationLog) public accessValidationLogs;
    mapping(address => mapping(address => AccessLog)) public accessLogs;

    event MedicalRecordProofRegistered(
        bytes32 indexed patientHash,
        bytes32 indexed recordIdHash,
        bytes32 dataHash,
        address indexed registeredBy,
        uint256 registeredAt
    );

    event ConsentApproved(
        bytes32 indexed consentIdHash,
        bytes32 indexed patientHash,
        bytes32 indexed clinicHash,
        bytes32 doctorHash,
        bytes32 scopesHash,
        uint256 expiresAt,
        address approvedBy,
        uint256 approvedAt
    );

    event ConsentRevoked(
        bytes32 indexed consentIdHash,
        bytes32 indexed patientHash,
        address revokedBy,
        uint256 revokedAt
    );

    event AccessValidated(
        bytes32 indexed accessIdHash,
        bytes32 indexed consentIdHash,
        bytes32 decisionHash,
        bytes32 requestedScopesHash,
        address registeredBy,
        uint256 createdAt
    );

    event AccessRecorded(
        address indexed patient,
        address indexed clinic,
        bool approved,
        bytes32 scope,
        uint256 timestamp
    );

    constructor(address _forwarder) {
        require(_forwarder != address(0), "Invalid CRE forwarder");
        cre_forwarder = _forwarder;
    }

    modifier onlyCREForwarder() {
        require(msg.sender == cre_forwarder, "Only CRE forwarder");
        _;
    }

    function registerMedicalRecordProof(
        bytes32 patientHash,
        bytes32 recordIdHash,
        bytes32 dataHash
    ) external {
        require(patientHash != bytes32(0), "Invalid patient hash");
        require(recordIdHash != bytes32(0), "Invalid record id hash");
        require(dataHash != bytes32(0), "Invalid data hash");
        require(
            !medicalRecordProofs[recordIdHash].exists,
            "Record proof already registered"
        );

        uint256 registeredAt = block.timestamp;

        medicalRecordProofs[recordIdHash] = MedicalRecordProof({
            patientHash: patientHash,
            recordIdHash: recordIdHash,
            dataHash: dataHash,
            registeredAt: registeredAt,
            registeredBy: msg.sender,
            exists: true
        });

        emit MedicalRecordProofRegistered(
            patientHash,
            recordIdHash,
            dataHash,
            msg.sender,
            registeredAt
        );
    }

    function approveConsent(
        bytes32 consentIdHash,
        bytes32 patientHash,
        bytes32 clinicHash,
        bytes32 doctorHash,
        bytes32 scopesHash,
        uint256 expiresAt
    ) external {
        require(consentIdHash != bytes32(0), "Invalid consent hash");
        require(patientHash != bytes32(0), "Invalid patient hash");
        require(clinicHash != bytes32(0), "Invalid clinic hash");
        require(doctorHash != bytes32(0), "Invalid doctor hash");
        require(scopesHash != bytes32(0), "Invalid scopes hash");
        require(expiresAt > block.timestamp, "Consent must expire in future");
        require(!consents[consentIdHash].exists, "Consent already approved");

        uint256 approvedAt = block.timestamp;

        consents[consentIdHash] = Consent({
            consentIdHash: consentIdHash,
            patientHash: patientHash,
            clinicHash: clinicHash,
            doctorHash: doctorHash,
            scopesHash: scopesHash,
            expiresAt: expiresAt,
            approvedAt: approvedAt,
            approvedBy: msg.sender,
            active: true,
            exists: true
        });

        emit ConsentApproved(
            consentIdHash,
            patientHash,
            clinicHash,
            doctorHash,
            scopesHash,
            expiresAt,
            msg.sender,
            approvedAt
        );
    }

    function revokeConsent(bytes32 consentIdHash) external {
        Consent storage consent = consents[consentIdHash];

        require(consent.exists, "Consent not found");
        require(consent.active, "Consent is not active");

        consent.active = false;

        emit ConsentRevoked(
            consentIdHash,
            consent.patientHash,
            msg.sender,
            block.timestamp
        );
    }

    function registerAccessValidation(
        bytes32 accessIdHash,
        bytes32 consentIdHash,
        bytes32 decisionHash,
        bytes32 requestedScopesHash
    ) external {
        require(accessIdHash != bytes32(0), "Invalid access hash");
        require(consentIdHash != bytes32(0), "Invalid consent hash");
        require(decisionHash != bytes32(0), "Invalid decision hash");
        require(
            requestedScopesHash != bytes32(0),
            "Invalid requested scopes hash"
        );
        require(
            !accessValidationLogs[accessIdHash].exists,
            "Access already registered"
        );
        require(consents[consentIdHash].exists, "Consent not found");

        uint256 createdAt = block.timestamp;

        accessValidationLogs[accessIdHash] = AccessValidationLog({
            accessIdHash: accessIdHash,
            consentIdHash: consentIdHash,
            decisionHash: decisionHash,
            requestedScopesHash: requestedScopesHash,
            createdAt: createdAt,
            registeredBy: msg.sender,
            exists: true
        });

        emit AccessValidated(
            accessIdHash,
            consentIdHash,
            decisionHash,
            requestedScopesHash,
            msg.sender,
            createdAt
        );
    }

    function recordAccess(
        address patient,
        address clinic,
        bool approved,
        bytes32 scope,
        bytes32 documentHash
    ) external onlyCREForwarder {
        accessLogs[patient][clinic] = AccessLog({
            clinic: clinic,
            scope: scope,
            approved: approved,
            timestamp: block.timestamp,
            documentHash: documentHash
        });

        emit AccessRecorded(
            patient,
            clinic,
            approved,
            scope,
            block.timestamp
        );
    }

    function isConsentActive(bytes32 consentIdHash) external view returns (bool) {
        Consent memory consent = consents[consentIdHash];

        if (!consent.exists) {
            return false;
        }

        if (!consent.active) {
            return false;
        }

        if (consent.expiresAt <= block.timestamp) {
            return false;
        }

        return true;
    }

    function getConsentById(
        bytes32 consentIdHash
    ) external view returns (Consent memory) {
        return consents[consentIdHash];
    }

    function getConsent(
        address patient,
        address clinic
    ) external view returns (bool hasConsent, uint256 expiry) {
        AccessLog memory log = accessLogs[patient][clinic];

        return (log.approved, log.timestamp + 24 hours);
    }

    function hashString(string calldata value) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(value));
    }
}
