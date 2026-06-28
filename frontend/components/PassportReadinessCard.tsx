"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { PassportNftEligibility } from "@/lib/types";

type PassportReadinessCardProps = {
  wallet?: string | null;
};

export default function PassportReadinessCard({
  wallet,
}: PassportReadinessCardProps) {
  const [eligibility, setEligibility] =
    useState<PassportNftEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEligibility = useCallback(async () => {
    if (!wallet) {
      setEligibility(null);
      setError(null);
      setLoading(false);
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
      console.error("Failed to load passport readiness:", loadError);
      setError("Passport readiness is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadEligibility());
  }, [loadEligibility]);

  const completed =
    eligibility?.requirements.filter((requirement) => requirement.met).length ??
    0;
  const total = eligibility?.requirements.length ?? 3;

  return (
    <Link
      href="/passport/mint"
      className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
            Passport NFT
          </p>
          <h2 className="mt-2 text-2xl font-bold">Passport Readiness</h2>
          <p className="mt-1 text-sm text-gray-400">
            Prepare for the future Soulbound Builder Passport mint.
          </p>
        </div>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-gray-300">
          Coming Soon
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Readiness</span>
          <span className="font-medium">
            {wallet ? `${completed}/${total}` : "Connect wallet"}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${wallet ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {loading && <p className="mt-3 text-sm text-gray-500">Loading...</p>}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {!wallet && (
        <p className="mt-3 text-sm text-gray-500">
          Connect wallet to check eligibility.
        </p>
      )}
    </Link>
  );
}
