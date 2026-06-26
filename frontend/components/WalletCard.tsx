"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

type WalletCardProps = {
  wallet: string;
  loading: boolean;
  inputId?: string;
  onWalletChange: (wallet: string) => void;
  onLoadPassport: () => void;
};

export default function WalletCard({
  wallet,
  loading,
  inputId,
  onWalletChange,
  onLoadPassport,
}: WalletCardProps) {
  return (
    <>
      <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Wallet</h2>
        <ConnectButton />
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Load Passport</h2>

        <input
          id={inputId}
          className="w-full bg-black border border-zinc-700 rounded-xl p-3"
          placeholder="Enter wallet address"
          value={wallet}
          onChange={(event) => onWalletChange(event.target.value)}
        />

        <button
          onClick={onLoadPassport}
          disabled={loading || !wallet}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Passport"}
        </button>
      </div>
    </>
  );
}
