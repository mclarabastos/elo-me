import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const EloConsentRegistry = await ethers.getContractFactory(
    "EloConsentRegistry"
  );

  const registry = await EloConsentRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log(`EloConsentRegistry deployed to: ${address}`);
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("");
  console.log("Next steps:");
  console.log("- Copy the contract address to the backend env when integration starts.");
  console.log("- Store chain_id and transaction_hash with consent/audit records later.");
  console.log("- Share the address with frontend/README after testnet deploy.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
