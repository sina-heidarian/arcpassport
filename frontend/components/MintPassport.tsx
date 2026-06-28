"use client";

import { useCallback, useEffect, useState } from "react";
import SbtContractStatus from "@/components/SbtContractStatus";
import { apiGet } from "@/lib/api";
import type { PassportNftEligibility } from "@/lib/types";

type MintPassportProps = {
  wallet: string;
};

export default function MintPassport({ wallet }: MintPassportProps) {
  const [eligibility, setEligibility] =
    useState<PassportNftEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEligibility = useCallback(async () => {
    if (!wallet) {
      setEligibility(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<PassportNftEligibility>(
        `/api/v1/passport/${encodeURIComponent(wallet)}/eligibility`
      );
      setEligibility(data);
    } catch (loadError) {
      console.error("Failed to load Builder Passport eligibility:", loadError);
      setError("Builder Passport eligibility is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadEligibility());
  }, [loadEligibility]);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Builder Passport NFT</h2>
          <p className="text-gray-400 mt-1">
            ArcPassportSBT is registered for Arc Testnet. Minting remains
            disabled until the launch flow is enabled.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="bg-white text-black rounded-xl px-5 py-3 font-medium opacity-50"
        >
          Coming Soon
        </button>
      </div>

      <SbtContractStatus compact />

      {loading && <StatusMessage message="Checking eligibility..." />}

      {eligibility && (
        <StatusMessage
          message={
            eligibility.eligible
              ? "Eligible for future minting."
              : eligibility.reason
          }
          tone={eligibility.eligible ? "success" : "muted"}
        />
      )}

      {error && <StatusMessage message={error} tone="error" />}
    </div>
  );
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
