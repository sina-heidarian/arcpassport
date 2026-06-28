"use client";

import { useCallback, useEffect, useState } from "react";
import { usePassportContext } from "@/components/PassportProvider";
import {
  ARCPASSPORT_SBT_ADDRESS,
  type BuilderPassportToken,
  type MintStatus,
  getBuilderPassportToken,
  getMintErrorMessage,
  sendMintBuilderPassportTransaction,
} from "@/lib/arcPassportSbt";
import { apiGet } from "@/lib/api";
import type { PassportNftEligibility } from "@/lib/types";

type MintPassportProps = {
  wallet: string;
};

export default function MintPassport({ wallet }: MintPassportProps) {
  const { isConnected, refreshPassport } = usePassportContext();
  const [status, setStatus] = useState<MintStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [token, setToken] = useState<BuilderPassportToken | null>(null);
  const [eligibility, setEligibility] =
    useState<PassportNftEligibility | null>(null);

  const loadMintState = useCallback(async () => {
    if (!wallet || !isConnected) {
      setToken(null);
      setEligibility(null);
      return;
    }

    setStatus("checking");
    setError(null);

    try {
      const [tokenData, eligibilityData] = await Promise.all([
        getBuilderPassportToken(wallet),
        apiGet<PassportNftEligibility>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/eligibility`
        ),
      ]);

      setToken(tokenData);
      setEligibility(eligibilityData);
      setStatus("idle");
    } catch (loadError) {
      console.error("Failed to load Builder Passport mint state:", loadError);
      setError(getMintErrorMessage(loadError));
      setStatus("error");
    }
  }, [isConnected, wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadMintState());
  }, [loadMintState]);

  async function mintPassport() {
    setStatus("waiting_wallet");
    setError(null);
    setTxHash(null);

    try {
      const transaction = await sendMintBuilderPassportTransaction();
      setTxHash(transaction.txHash);
      setStatus("waiting_confirmation");

      await transaction.wait();

      setStatus("success");
      await refreshPassport(true);
      window.dispatchEvent(new Event("arcpassport:quests-refresh"));
      await loadMintState();
    } catch (mintError) {
      console.error("Builder Passport mint failed:", mintError);
      setError(getMintErrorMessage(mintError));
      setStatus("error");
    }
  }

  const alreadyMinted = Boolean(token?.tokenId);
  const eligible = Boolean(eligibility?.eligible);
  const disabled =
    !isConnected ||
    !ARCPASSPORT_SBT_ADDRESS ||
    alreadyMinted ||
    !eligible ||
    status === "checking" ||
    status === "waiting_wallet" ||
    status === "waiting_confirmation";

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Builder Passport NFT</h2>
          <p className="text-gray-400 mt-1">
            Mint your onchain builder identity for Arc.
          </p>
        </div>

        <button
          onClick={mintPassport}
          disabled={disabled}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          {buttonLabel(status, alreadyMinted)}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PreviewItem
          label="Contract Address"
          value={ARCPASSPORT_SBT_ADDRESS || "Not configured"}
        />
        <PreviewItem label="Token ID" value={token?.tokenId ?? "Not minted"} />
        <PreviewItem label="Owner Address" value={token?.ownerAddress ?? "-"} />
        <PreviewItem
          label="Mint Date"
          value={token?.mintDate ? new Date(token.mintDate).toLocaleString() : "-"}
        />
      </div>

      {status === "waiting_wallet" && (
        <StatusMessage message="Waiting for wallet..." />
      )}
      {status === "waiting_confirmation" && (
        <StatusMessage message="Waiting for confirmation..." />
      )}
      {status === "success" && <StatusMessage message="Success" />}

      {txHash && (
        <div className="bg-black border border-zinc-800 rounded-xl p-4">
          <p className="text-gray-500 text-sm">Transaction Hash</p>
          <p className="font-semibold mt-1 break-all">{txHash}</p>
        </div>
      )}

      {alreadyMinted && (
        <StatusMessage message="Passport already minted" tone="success" />
      )}

      {!alreadyMinted && eligibility && !eligibility.eligible && (
        <StatusMessage message={eligibility.reason} tone="muted" />
      )}

      {error && <StatusMessage message={error} tone="error" />}
    </div>
  );
}

function buttonLabel(status: MintStatus, alreadyMinted: boolean) {
  if (alreadyMinted) return "Passport already minted";
  if (status === "checking") return "Checking...";
  if (status === "waiting_wallet") return "Waiting for wallet...";
  if (status === "waiting_confirmation") return "Waiting for confirmation...";
  if (status === "success") return "Minted";
  return "Mint Builder Passport";
}

function StatusMessage({
  message,
  tone = "default",
}: {
  message: string;
  tone?: "default" | "success" | "error" | "muted";
}) {
  const className =
    tone === "success"
      ? "border-green-900 bg-green-950/30 text-green-300"
      : tone === "error"
        ? "border-red-900 bg-red-950/30 text-red-300"
        : tone === "muted"
          ? "border-zinc-800 bg-black text-gray-400"
          : "border-blue-900 bg-blue-950/30 text-blue-300";

  return (
    <div className={`rounded-xl border p-4 text-sm font-medium ${className}`}>
      {message}
    </div>
  );
}

function PreviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-semibold mt-1 break-all">{value}</p>
    </div>
  );
}
