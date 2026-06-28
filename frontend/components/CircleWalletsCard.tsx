"use client";

import { useEffect, useState } from "react";
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
      setError("Unable to load Circle wallets.");
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
        setError("Unable to load Circle wallets.");
      }
    }

    void loadInitialWallets();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleWallets = compact ? wallets.slice(0, 1) : wallets;

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Circle Wallets</h3>
          <p className="text-sm text-gray-400 mt-1">
            Developer-controlled wallets returned by Circle.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadWallets()}
          disabled={loading}
          className="bg-white text-black rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Wallets"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
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
    </section>
  );
}

function CircleWalletItem({ wallet }: { wallet: CircleWallet }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4 space-y-4">
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
    </div>
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
