import { artifacts, ethers, network } from "hardhat";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Arc Testnet deployment`);
  }

  return value;
}

async function assertNetworkReachable() {
  try {
    await ethers.provider.getBlockNumber();
  } catch {
    throw new Error("Arc Testnet RPC is unreachable");
  }
}

async function assertContractBytecodeExists() {
  const artifact = await artifacts.readArtifact("ArcPassportSBT");

  if (!artifact.bytecode || artifact.bytecode === "0x") {
    throw new Error("ArcPassportSBT bytecode is missing. Run npx hardhat compile.");
  }
}

async function main() {
  requireEnv("ARC_TESTNET_RPC_URL");
  requireEnv("DEPLOYER_PRIVATE_KEY");
  await assertNetworkReachable();
  await assertContractBytecodeExists();

  const [deployer] = await ethers.getSigners();
  const networkDetails = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  if (balance === 0n) {
    throw new Error("Deployer wallet has zero balance");
  }

  const ArcPassportSBT = await ethers.getContractFactory("ArcPassportSBT");
  const passport = await ArcPassportSBT.deploy(deployer.address);
  const deploymentTransaction = passport.deploymentTransaction();

  await passport.waitForDeployment();

  console.log("ArcPassportSBT deployment prepared");
  console.log("Deployer:", deployer.address);
  console.log("Network:", network.name);
  console.log("Chain ID:", networkDetails.chainId.toString());
  console.log("Contract address:", await passport.getAddress());
  console.log("Transaction hash:", deploymentTransaction?.hash ?? "unavailable");
}

main().catch((error) => {
  console.error("ArcPassportSBT deployment failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
