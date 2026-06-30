"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { apiGet } from "@/lib/api";
import type { PassportNftOwnership as PassportNftOwnershipType } from "@/lib/types";

type PassportNftOwnershipProps = {
  wallet?: string | null;
  initialOwnership?: PassportNftOwnershipType | null;
  compact?: boolean;
};

export default function PassportNftOwnership({
  wallet,
  initialOwnership = null,
  compact = false,
}: PassportNftOwnershipProps) {
  const [ownership, setOwnership] =
    useState<PassportNftOwnershipType | null>(initialOwnership);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOwnership = useCallback(async () => {
    if (!wallet || initialOwnership) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<PassportNftOwnershipType>(
        `/api/v1/passport-nft/${encodeURIComponent(wallet)}/ownership`
      );
      setOwnership(data);
    } catch (loadError) {
      console.error("Failed to load Builder Passport ownership:", loadError);
      setError("Builder Passport ownership is unavailable.");
    } finally {
      setLoading(false);
    }
  }, [initialOwnership, wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadOwnership());
  }, [loadOwnership]);

  return (
    <PassportNftOwnershipView
      ownership={ownership}
      loading={loading}
      error={error}
      compact={compact}
    />
  );
}

export function PassportNftOwnershipView({
  ownership,
  loading = false,
  error = null,
  compact = false,
}: {
  ownership: PassportNftOwnershipType | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}) {
  const [showMetadata, setShowMetadata] = useState(false);

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
              Passport NFT
            </p>
            <h2 className="text-xl font-bold">
              {ownership?.owns_passport
                ? "ArcPassport SBT Minted"
                : "ArcPassport SBT"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {ownership?.owns_passport
                ? `Token ID: ${ownership.token_id ?? "Unknown"}`
                : "No Builder Passport minted yet."}
            </p>
            {ownership?.owns_passport && (
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                <p>Minted via ArcPassport Admin</p>
                <p className="break-all">Recipient wallet: {ownership.wallet}</p>
              </div>
            )}
          </div>

          {ownership?.owns_passport && ownership.explorer_url && (
            <Button
              href={ownership.explorer_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              View Contract
            </Button>
          )}
        </div>

        {loading && (
          <p className="mt-3 text-sm text-gray-500">Checking ownership...</p>
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
            Passport NFT
          </p>
          <h2 className="text-2xl font-bold">Builder Passport Ownership</h2>
          <p className="mt-1 text-sm text-gray-400">
            {ownership?.owns_passport
              ? "Builder Passport minted"
              : "No Builder Passport minted yet."}
          </p>
          {ownership?.owns_passport && (
            <div className="mt-2 space-y-1 text-sm text-gray-400">
              <p>Minted via ArcPassport Admin</p>
              <p className="break-all">Recipient wallet: {ownership.wallet}</p>
            </div>
          )}
        </div>

        {ownership?.explorer_url && (
          <Button
            href={ownership.explorer_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            View Contract
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Checking ownership...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {ownership && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OwnershipItem label="Wallet" value={ownership.wallet} />
          <OwnershipItem
            label="Token ID"
            value={
              ownership.token_id === null
                ? "Not minted"
                : ownership.token_id.toString()
            }
          />
          <OwnershipItem
            label="Contract Address"
            value={ownership.contract_address}
          />
        </div>
      )}

      {ownership?.token_uri && (
        <div>
          <Button
            type="button"
            onClick={() => setShowMetadata((current) => !current)}
            variant="secondary"
          >
            {showMetadata ? "Hide Metadata" : "Show Metadata"}
          </Button>
          {showMetadata && (
            <p className="mt-3 max-h-32 overflow-auto break-all rounded-xl border border-zinc-800 bg-black p-4 text-xs text-gray-500">
              {ownership.token_uri}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function OwnershipItem({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="muted">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-all font-semibold text-gray-100">{value}</p>
    </Card>
  );
}
