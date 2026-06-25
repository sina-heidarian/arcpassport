"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Navbar from "@/components/Navbar";

type FaucetAsset = "USDC" | "EURC" | "cirBTC";

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
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <Navbar active="faucet" compact />

        <div className="bg-zinc-900 rounded-2xl p-4 space-y-5">
          <div>
            <h2 className="text-xl font-bold">Circle Faucet</h2>
            <p className="text-sm text-gray-400 mt-1">
              Request Arc Testnet assets from Circle.
            </p>
          </div>

          <ConnectButton />

          {isConnected && walletAddress && (
            <div className="bg-black border border-zinc-800 rounded-xl p-3">
              <p className="text-xs text-gray-500">Connected Wallet</p>
              <p className="text-sm font-semibold mt-1">{shortWallet}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400 mb-3">Select Asset</p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAsset("USDC")}
                className={`rounded-xl border p-4 flex flex-col items-center gap-2 ${
                  asset === "USDC"
                    ? "bg-white text-black border-white"
                    : "bg-black border-zinc-700"
                }`}
              >
                <div className="text-3xl">💵</div>
                <span className="font-bold">USDC</span>
              </button>

              <button
                onClick={() => setAsset("EURC")}
                className={`rounded-xl border p-4 flex flex-col items-center gap-2 ${
                  asset === "EURC"
                    ? "bg-white text-black border-white"
                    : "bg-black border-zinc-700"
                }`}
              >
                <div className="text-3xl">💶</div>
                <span className="font-bold">EURC</span>
              </button>

              <button
                onClick={() => setAsset("cirBTC")}
                className={`rounded-xl border p-4 flex flex-col items-center gap-2 ${
                  asset === "cirBTC"
                    ? "bg-white text-black border-white"
                    : "bg-black border-zinc-700"
                }`}
              >
                <div className="text-3xl">₿</div>
                <span className="font-bold">cirBTC</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Wallet Address</label>

            <input
              readOnly
              className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3 text-gray-300"
              placeholder="Connect wallet first"
              value={walletAddress}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black border border-zinc-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Network</p>
              <p className="text-xl font-bold mt-1">Arc Testnet</p>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-xl font-bold mt-1">
                {amount} {asset}
              </p>
            </div>
          </div>

          <a
            href="https://faucet.circle.com/"
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-white text-black rounded-xl px-5 py-3 font-bold"
          >
            {claimLabel}
          </a>

          <div className="text-xs text-center text-gray-500">
            20 USDC / 20 EURC / 0.0001 cirBTC
            <br />
            One request every 2 hours.
          </div>

          {isConnected && (
            <div className="text-xs text-green-400 text-center">
              Wallet connected ✓
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
