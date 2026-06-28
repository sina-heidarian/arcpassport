import { ethers, network } from "hardhat";

type CheckResult = {
  label: string;
  passed: boolean;
  detail?: string;
};

function printCheck(result: CheckResult) {
  const status = result.passed ? "PASS" : "FAIL";
  const detail = result.detail ? ` - ${result.detail}` : "";
  console.log(`${status} ${result.label}${detail}`);
}

async function main() {
  const results: CheckResult[] = [];
  const rpcUrl = process.env.ARC_TESTNET_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  results.push({
    label: "ARC_TESTNET_RPC_URL exists",
    passed: Boolean(rpcUrl),
  });

  results.push({
    label: "DEPLOYER_PRIVATE_KEY exists",
    passed: Boolean(privateKey),
  });

  if (!rpcUrl || !privateKey) {
    results.forEach(printCheck);
    process.exitCode = 1;
    return;
  }

  try {
    await ethers.provider.getBlockNumber();
    results.push({
      label: "Network reachable",
      passed: true,
      detail: network.name,
    });
  } catch {
    results.push({
      label: "Network reachable",
      passed: false,
      detail: "RPC request failed",
    });
  }

  try {
    const networkDetails = await ethers.provider.getNetwork();
    results.push({
      label: "Chain ID readable",
      passed: true,
      detail: networkDetails.chainId.toString(),
    });
  } catch {
    results.push({
      label: "Chain ID readable",
      passed: false,
      detail: "Could not read chain id",
    });
  }

  let deployerAddress: string | null = null;

  try {
    const wallet = new ethers.Wallet(privateKey);
    deployerAddress = wallet.address;
    results.push({
      label: "Deployer address derived",
      passed: true,
      detail: deployerAddress,
    });
  } catch {
    results.push({
      label: "Deployer address derived",
      passed: false,
      detail: "Invalid private key format",
    });
  }

  try {
    if (!deployerAddress) {
      throw new Error("Missing deployer address");
    }

    const balance = await ethers.provider.getBalance(deployerAddress);

    results.push({
      label: "Wallet balance readable",
      passed: true,
      detail: `${deployerAddress} balance ${ethers.formatEther(balance)} ETH`,
    });
  } catch {
    results.push({
      label: "Wallet balance readable",
      passed: false,
      detail: "Could not read deployer balance",
    });
  }

  results.forEach(printCheck);

  if (results.some((result) => !result.passed)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("FAIL Environment verification failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
