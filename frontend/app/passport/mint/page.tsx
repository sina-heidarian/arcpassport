"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  PassportNftOwnershipView,
} from "@/components/PassportNftOwnership";
import { usePassportContext } from "@/components/PassportProvider";
import PassportNftPreview, {
  RequirementsChecklist,
} from "@/components/PassportNftPreview";
import SbtContractStatus from "@/components/SbtContractStatus";
import { apiGet, apiPost } from "@/lib/api";
import type {
  PassportNftEligibility,
  PassportNftMintResponse,
  PassportNftMetadata,
  PassportNftOwnership as PassportNftOwnershipType,
  PassportNftTokenUri,
} from "@/lib/types";

type MintStatus = "idle" | "waiting" | "success" | "error";

export default function PassportMintPage() {
  const { wallet, isConnected, passport, loading, refreshPassport } =
    usePassportContext();
  const [metadata, setMetadata] = useState<PassportNftMetadata | null>(null);
  const [tokenUri, setTokenUri] = useState<PassportNftTokenUri | null>(null);
  const [ownership, setOwnership] =
    useState<PassportNftOwnershipType | null>(null);
  const [eligibility, setEligibility] =
    useState<PassportNftEligibility | null>(null);
  const [mintResult, setMintResult] = useState<PassportNftMintResponse | null>(
    null
  );
  const [mintStatus, setMintStatus] = useState<MintStatus>("idle");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!wallet) {
      setMetadata(null);
      setTokenUri(null);
      setOwnership(null);
      setEligibility(null);
      setError(null);
      setPreviewLoading(false);
      return;
    }

    setPreviewLoading(true);
    setError(null);

    try {
      const [
        metadataData,
        tokenUriData,
        eligibilityData,
        ownershipData,
      ] = await Promise.all([
        apiGet<PassportNftMetadata>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/metadata`
        ),
        apiGet<PassportNftTokenUri>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/token-uri`
        ),
        apiGet<PassportNftEligibility>(
          `/api/v1/passport/${encodeURIComponent(wallet)}/eligibility`
        ),
        apiGet<PassportNftOwnershipType>(
          `/api/v1/passport-nft/${encodeURIComponent(wallet)}/ownership`
        ),
      ]);
      setMetadata(metadataData);
      setTokenUri(tokenUriData);
      setEligibility(eligibilityData);
      setOwnership(ownershipData);
    } catch (loadError) {
      console.error("Failed to load Builder Passport NFT preview:", loadError);
      setError("Builder Passport NFT preview is unavailable.");
    } finally {
      setPreviewLoading(false);
    }
  }, [wallet]);

  async function mintPassport() {
    if (!wallet) {
      return;
    }

    setMintStatus("waiting");
    setMintResult(null);
    setError(null);

    try {
      const result = await apiPost<PassportNftMintResponse>(
        `/api/v1/passport-nft/${encodeURIComponent(wallet)}/mint`
      );
      setMintResult(result);
      setMintStatus("success");
      await refreshPassport(true);
      await loadPreview();
      window.dispatchEvent(new Event("arcpassport:quests-refresh"));
    } catch (mintError) {
      console.error("Failed to mint Builder Passport:", mintError);
      setMintStatus("error");
      setError("Builder Passport mint failed.");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadPreview());
  }, [loadPreview]);

  const canMint = Boolean(
    isConnected &&
      wallet &&
      eligibility?.eligible &&
      ownership &&
      !ownership.owns_passport &&
      mintStatus !== "waiting"
  );

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

        <SbtContractStatus />

        <PassportNftOwnershipView
          ownership={ownership}
          loading={Boolean(wallet && previewLoading)}
        />

        <PassportNftPreview metadata={metadata} eligibility={eligibility} />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-xl font-bold">Mint Status</h3>
            <p className="mt-2 text-sm text-gray-400">
              Metadata is prepared for ArcPassportSBT. Eligible connected
              wallets can mint through the backend admin wallet.
            </p>
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
              <p className="text-sm text-gray-500">Token URI Status</p>
              <p className="mt-1 font-semibold text-green-300">
                {tokenUri ? "Ready" : "Waiting for wallet"}
              </p>
              {tokenUri && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowMetadata((current) => !current)}
                    className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-gray-200 hover:border-zinc-500"
                  >
                    {showMetadata ? "Hide Metadata" : "Show Metadata"}
                  </button>
                  {showMetadata && (
                    <p className="mt-3 max-h-24 overflow-auto break-all rounded-xl border border-zinc-800 p-3 text-xs text-gray-500">
                      {tokenUri.token_uri}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={mintPassport}
              disabled={!canMint}
              className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              {mintStatus === "waiting"
                ? "Waiting for mint..."
                : "Mint Builder Passport"}
            </button>

            {ownership?.owns_passport && (
              <div className="mt-4 rounded-xl border border-green-900 bg-black p-4">
                <p className="font-semibold text-green-300">
                  Builder Passport Minted
                </p>
                <p className="mt-2 text-sm text-gray-300">
                  Token ID: {ownership.token_id ?? "Unknown"}
                </p>
                <p className="mt-2 break-all text-xs text-gray-400">
                  Contract Address: {ownership.contract_address}
                </p>
                <a
                  href={ownership.explorer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  View Contract on ArcScan
                </a>
              </div>
            )}

            {mintStatus === "waiting" && (
              <p className="mt-3 text-sm text-blue-300">Waiting for mint...</p>
            )}

            {mintStatus === "success" && mintResult && (
              <div className="mt-4 rounded-xl border border-green-900 bg-green-950/30 p-4">
                <p className="font-semibold text-green-300">
                  {mintResult.already_minted
                    ? "Builder Passport already minted"
                    : "Mint successful"}
                </p>
                {mintResult.token_id && (
                  <p className="mt-2 text-sm text-gray-300">
                    Token ID: {mintResult.token_id}
                  </p>
                )}
                {mintResult.already_minted && (
                  <p className="mt-2 break-all text-xs text-gray-400">
                    Contract Address: {mintResult.contract_address}
                  </p>
                )}
                {!mintResult.already_minted && mintResult.tx_hash && (
                  <>
                    <p className="mt-2 break-all text-xs text-gray-300">
                      Transaction hash: {mintResult.tx_hash}
                    </p>
                    {mintResult.block_number && (
                      <p className="mt-2 text-xs text-gray-400">
                        Block number: {mintResult.block_number}
                      </p>
                    )}
                  </>
                )}
                <a
                  href={mintResult.explorer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  {mintResult.already_minted
                    ? "View Contract on ArcScan"
                    : "View transaction on ArcScan"}
                </a>
              </div>
            )}

            {mintStatus === "error" && (
              <p className="mt-3 text-sm text-red-300">
                Mint failed. Check backend logs and wallet eligibility.
              </p>
            )}
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
