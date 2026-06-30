"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Badge, Button, Card, PageHeader, PageShell, StatCard } from "@/components/ui";

type FaucetAsset = "USDC" | "EURC" | "cirBTC";

const assets: FaucetAsset[] = ["USDC", "EURC", "cirBTC"];

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const [asset, setAsset] = useState<FaucetAsset>("USDC");
  const walletAddress = address ?? "";
  const amount = asset === "cirBTC" ? "0.0001" : "20";
  const claimLabel =
    asset === "USDC"
      ? "Claim 20 USDC"
      : asset === "EURC"
      ? "Claim 20 EURC"
      : "Claim 0.0001 cirBTC";
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "No wallet selected";

  return (
    <PageShell active="faucet" width="narrow">
      <PageHeader
        title="Circle Faucet"
        description="Request Arc Testnet assets from Circle."
      />

      <Card className="space-y-5">
        {isConnected && walletAddress && (
          <Card variant="muted" className="p-3">
            <p className="text-xs text-gray-500">Connected Wallet</p>
            <p className="font-mono mt-1 text-sm font-semibold">{shortWallet}</p>
          </Card>
        )}

        <div>
          <p className="mb-3 text-sm text-gray-400">Select Asset</p>
          <div className="grid grid-cols-3 gap-3">
            {assets.map((option) => (
              <button
                key={option}
                onClick={() => setAsset(option)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${
                  asset === option
                    ? "border-white bg-white text-black"
                    : "border-zinc-700 bg-black"
                }`}
              >
                <span className="font-mono text-xl font-bold">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Wallet Address</label>
          <input
            readOnly
            className="font-mono mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-gray-300"
            placeholder="Connect wallet first"
            value={walletAddress}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Network" value="Arc Testnet" />
          <StatCard label="Amount" value={`${amount} ${asset}`} />
        </div>

        <Button href="https://faucet.circle.com/" className="w-full">
          {claimLabel}
        </Button>

        <div className="text-center text-xs text-gray-500">
          20 USDC / 20 EURC / 0.0001 cirBTC
          <br />
          One request every 2 hours.
        </div>

        {isConnected && (
          <div className="text-center">
            <Badge tone="green">Wallet connected</Badge>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
