"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { usePassportContext } from "@/components/PassportProvider";
import PassportNftPreview, {
  RequirementsChecklist,
} from "@/components/PassportNftPreview";
import { apiGet } from "@/lib/api";
import type {
  PassportNftEligibility,
  PassportNftMetadata,
} from "@/lib/types";

export default function PassportMintPage() {
  const { wallet, isConnected, passport, loading } = usePassportContext();
  const [metadata, setMetadata] = useState<PassportNftMetadata | null>(null);
  const [eligibility, setEligibility] =
    useState<PassportNftEligibility | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    if (!wallet) {
      setMetadata(null);
      setEligibility(null);
      setError(null);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    setError(null);

    try {
      const [metadataData, eligibilityData] = await Promise.all([
        apiGet<PassportNftMetadata>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/metadata`
        ),
        apiGet<PassportNftEligibility>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/eligibility`
        ),
      ]);
      setMetadata(metadataData);
      setEligibility(eligibilityData);
    } catch (loadError) {
      console.error("Failed to load Builder Passport NFT preview:", loadError);
      setError("Builder Passport NFT preview is unavailable.");
    } finally {
      setPreviewLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadPreview());
  }, [loadPreview]);

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Navbar active="workspace" />

        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
            Passport NFT
          </p>
          <h2 className="text-3xl font-bold">Builder Passport Preview</h2>
          <p className="max-w-2xl text-gray-400">
            Preview the future Soulbound Builder Passport metadata and mint
            readiness. No NFT is minted from this page yet.
          </p>
        </section>

        {!isConnected && (
          <div className="rounded-2xl bg-zinc-900 p-6">
            <h2 className="text-2xl font-bold">Connect your wallet</h2>
            <p className="mt-2 text-gray-400">
              Connect your wallet to preview Builder Passport NFT eligibility
              and metadata.
            </p>
          </div>
        )}

        {isConnected && (loading || previewLoading) && (
          <div className="rounded-2xl bg-zinc-900 p-6 text-gray-400">
            Loading Builder Passport preview...
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-zinc-900 p-6 text-red-300">
            {error}
          </div>
        )}

        <PassportNftPreview metadata={metadata} eligibility={eligibility} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-xl font-bold">Mint Status</h3>
            <p className="mt-2 text-sm text-gray-400">
              Architecture prepared. Contract deployment and NFT minting are
              intentionally disabled until the mint implementation phase.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black opacity-50"
            >
              Coming Soon
            </button>
          </div>

          {eligibility ? (
            <RequirementsChecklist eligibility={eligibility} />
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-xl font-bold">Eligibility</h3>
              <p className="mt-2 text-sm text-gray-400">
                Eligibility appears after a wallet is connected.
              </p>
            </div>
          )}
        </section>

        {passport && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-gray-400">
            Previewing passport data for{" "}
            <span className="break-all text-gray-200">{passport.wallet}</span>.
          </div>
        )}
      </div>
    </main>
  );
}
