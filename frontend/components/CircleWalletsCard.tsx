"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { apiGet } from "@/lib/api";

type CircleWallet = {
  id?: string;
  state?: string;
  walletSetId?: string;
  custodyType?: string;
  address?: string;
  blockchain?: string;
  accountType?: string;
  createDate?: string;
  updateDate?: string;
  scaCore?: string;
};

type CircleWalletsResponse = {
  success: boolean;
  mode: "real";
  wallets: CircleWallet[];
};

export default function CircleWalletsCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [wallets, setWallets] = useState<CircleWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWallets() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<CircleWalletsResponse>("/circle/wallets");
      setWallets(data.wallets);
    } catch (loadError) {
      console.error("Failed to load Circle wallets:", loadError);
      setWallets([]);
      setError("Unable to load Circle wallets safely.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialWallets() {
      try {
        const data = await apiGet<CircleWalletsResponse>("/circle/wallets");

        if (!isMounted) {
          return;
        }

        setWallets(data.wallets);
      } catch (loadError) {
        console.error("Failed to load Circle wallets:", loadError);

        if (!isMounted) {
          return;
        }

        setWallets([]);
        setError("Unable to load Circle wallets safely.");
      }
    }

    void loadInitialWallets();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleWallets = compact ? wallets.slice(0, 1) : wallets;

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Circle Wallets</h3>
          <p className="text-sm text-gray-400 mt-1">
            Developer-controlled wallets returned by Circle.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => loadWallets()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Wallets"}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-400">
          Loading Circle wallets...
        </p>
      )}

      {!loading && !error && wallets.length === 0 && (
        <p className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-400">
          No Circle wallets found.
        </p>
      )}

      <div
        className={
          compact
            ? "space-y-3"
            : "grid grid-cols-1 gap-4 md:grid-cols-2"
        }
      >
        {visibleWallets.map((wallet) => (
          <CircleWalletItem key={wallet.id ?? wallet.address} wallet={wallet} />
        ))}
      </div>

      {compact && wallets.length > 1 && (
        <p className="text-sm text-gray-500">
          {wallets.length - 1} more Circle wallet
          {wallets.length - 1 === 1 ? "" : "s"} available.
        </p>
      )}
    </Card>
  );
}

function CircleWalletItem({ wallet }: { wallet: CircleWallet }) {
  return (
    <Card className="space-y-4" variant="muted">
      <div>
        <h4 className="text-base font-bold break-all">
          {wallet.address ?? "Unknown address"}
        </h4>
        <p className="text-xs text-gray-500 break-all mt-1">
          {wallet.id ?? "No wallet id"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <WalletField label="Blockchain" value={wallet.blockchain} />
        <WalletField label="Custody Type" value={wallet.custodyType} />
        <WalletField label="State" value={wallet.state} />
        <WalletField label="Account Type" value={wallet.accountType} />
        <WalletField label="Created Date" value={wallet.createDate} />
        <WalletField label="Updated Date" value={wallet.updateDate} />
      </div>
    </Card>
  );
}

function WalletField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 break-all text-gray-200">{value ?? "N/A"}</p>
    </div>
  );
}
