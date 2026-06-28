import { BrowserProvider, Contract, isAddress } from "ethers";

export const ARCPASSPORT_SBT_ADDRESS =
  process.env.NEXT_PUBLIC_ARCPASSPORT_SBT_ADDRESS ?? "";

const ARCPASSPORT_SBT_ABI = [
  "function mint() external returns (uint256)",
  "function passportOf(address builder) view returns (uint256)",
  "function tokenIdOf(address builder) view returns (uint256)",
  "function walletToTokenId(address builder) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event PassportMinted(address indexed builder, uint256 indexed tokenId, string tokenURI)",
];

export type MintStatus =
  | "idle"
  | "checking"
  | "waiting_wallet"
  | "waiting_confirmation"
  | "success"
  | "error";

export type BuilderPassportToken = {
  contractAddress: string;
  tokenId: string | null;
  ownerAddress: string | null;
  tokenURI: string | null;
  mintDate: string | null;
  txHash?: string;
};

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function assertContractConfigured() {
  if (!ARCPASSPORT_SBT_ADDRESS || !isAddress(ARCPASSPORT_SBT_ADDRESS)) {
    throw new Error("ArcPassportSBT contract address is not configured.");
  }
}

export function getMintErrorMessage(error: unknown) {
  const candidate = error as {
    code?: string | number;
    shortMessage?: string;
    reason?: string;
    message?: string;
  };
  const message = [
    candidate.shortMessage,
    candidate.reason,
    candidate.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (candidate.code === 4001 || message.includes("user rejected")) {
    return "Wallet rejected the transaction.";
  }

  if (message.includes("already") || message.includes("passportalreadyminted")) {
    return "Passport already minted.";
  }

  if (
    message.includes("network") ||
    message.includes("chain") ||
    message.includes("unsupported")
  ) {
    return "Network mismatch. Switch your wallet to Arc Testnet.";
  }

  if (message.includes("revert") || message.includes("execution reverted")) {
    return "Transaction reverted.";
  }

  if (
    message.includes("rpc") ||
    message.includes("could not coalesce") ||
    message.includes("failed to fetch")
  ) {
    return "RPC unavailable. Try again in a moment.";
  }

  return "Mint failed. Check your wallet and network.";
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("Wallet is not connected.");
  }

  return new BrowserProvider(window.ethereum);
}

export async function getPassportContract(withSigner = false) {
  assertContractConfigured();

  const provider = await getBrowserProvider();

  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(ARCPASSPORT_SBT_ADDRESS, ARCPASSPORT_SBT_ABI, signer);
  }

  return new Contract(ARCPASSPORT_SBT_ADDRESS, ARCPASSPORT_SBT_ABI, provider);
}

async function readTokenId(contract: Contract, wallet: string) {
  try {
    const tokenId = await contract.passportOf(wallet);
    return tokenId === BigInt(0) ? null : tokenId;
  } catch {
    // Continue through common SBT mapping names below.
  }

  try {
    const tokenId = await contract.tokenIdOf(wallet);
    return tokenId === BigInt(0) ? null : tokenId;
  } catch {
    // Continue through common SBT mapping names below.
  }

  try {
    const tokenId = await contract.walletToTokenId(wallet);
    return tokenId === BigInt(0) ? null : tokenId;
  } catch {
    // Continue through enumerable fallback below.
  }

  try {
    return await contract.tokenOfOwnerByIndex(wallet, 0);
  } catch {
    return null;
  }
}

export async function getBuilderPassportToken(
  wallet: string
): Promise<BuilderPassportToken> {
  const contract = await getPassportContract(false);
  const tokenId = await readTokenId(contract, wallet);

  if (!tokenId) {
    return {
      contractAddress: ARCPASSPORT_SBT_ADDRESS,
      tokenId: null,
      ownerAddress: null,
      tokenURI: null,
      mintDate: null,
    };
  }

  const [ownerAddress, tokenURI, mintDate] = await Promise.all([
    contract.ownerOf(tokenId),
    contract.tokenURI(tokenId).catch(() => null),
    getMintDate(contract, wallet, tokenId),
  ]);

  return {
    contractAddress: ARCPASSPORT_SBT_ADDRESS,
    tokenId: tokenId.toString(),
    ownerAddress,
    tokenURI,
    mintDate,
  };
}

export async function sendMintBuilderPassportTransaction() {
  const contract = await getPassportContract(true);
  const transaction = await contract.mint();

  return {
    txHash: transaction.hash as string,
    wait: () => transaction.wait(),
  };
}

async function getMintDate(contract: Contract, wallet: string, tokenId: bigint) {
  try {
    const event = contract.filters.PassportMinted(wallet, tokenId);
    const events = await contract.queryFilter(event, 0, "latest");
    const latestEvent = events.at(-1);

    if (!latestEvent) {
      return null;
    }

    const block = await latestEvent.getBlock();
    return new Date(Number(block.timestamp) * 1000).toISOString();
  } catch {
    return null;
  }
}
