"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { counterAbi, counterBytecode } from "@/lib/counterContract";

type Transaction = {
  hash: string;
  short_hash: string;
  type: string;
  status: string;
  timestamp: string;
  from: string | null;
  to: string | null;
};

type Passport = {
  wallet: string;
  level: number;
  xp: number;
  reputation: number;
  tx_count: number;
  nft_count: number;
  streak: number;
  rank: number;
  contract_calls: number;
  token_transfers: number;
  tokens_count: number;
  balance: number;
  checkin_available: boolean;
  checkin_xp: number;
  recent_transactions: Transaction[];
};

type LeaderboardUser = {
  wallet: string;
  xp: number;
  streak: number;
  checkin_xp: number;
  rank: number;
};

type Deployment = {
  contract_address: string;
  tx_hash: string;
  created_at: string;
};

type Achievement = {
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const {
    deployContract,
    data: deployHash,
    isPending: deployPending,
    error: deployError,
  } = useDeployContract();
  
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: deployHash,
  });

  function deployCounterContract() {
    deployContract({
      abi: counterAbi,
      bytecode: counterBytecode,
    });
  }
  const [wallet, setWallet] = useState("");
  const [passport, setPassport] = useState<Passport | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  async function loadLeaderboard() {
    try {
      const res = await fetch("http://localhost:8000/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }

  async function loadDeployments(walletAddress: string) {
    try {
      const res = await fetch(`http://localhost:8000/deployments/${walletAddress}`);
      const data = await res.json();
      setDeployments(data.deployments || []);
    } catch (error) {
      console.error("Failed to load deployments:", error);
    }
  }

  async function loadPassport() {
    if (!wallet) return;

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/passport/${wallet}`);
      const data = await res.json();
      setPassport(data);
      await loadLeaderboard();
      await loadDeployments(wallet);
    } catch (error) {
      console.error("Failed to load passport:", error);
    } finally {
      setLoading(false);
    }
  }

  async function dailyCheckin() {
    if (!passport) return;

    setCheckinLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/checkin/${passport.wallet}`,
        { method: "POST" }
      );

      const data = await res.json();
      alert(data.message);

      await loadPassport();
      await loadLeaderboard();
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setCheckinLoading(false);
    }
  }


  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setWallet(address);
    }
  }, [isConnected, address]);

  useEffect(() => {
    async function saveDeployment() {
      if (
        !receipt?.contractAddress ||
        !deployHash ||
        !address
      ) {
        return;
      }
  
      try {
        await fetch("http://localhost:8000/deployment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: address,
            contract_address: receipt.contractAddress,
            tx_hash: deployHash,
          }),
        });
  
          alert("🎉 Builder XP +100 awarded!");
          await loadDeployments(address);
          await loadPassport();
          await loadLeaderboard();
      } catch (err) {
        console.error(err);
      }
    }
  
    saveDeployment();
  }, [receipt, deployHash, address]);

  const xpInLevel = passport ? passport.xp % 100 : 0;
  const xpProgress = passport ? Math.min(xpInLevel, 100) : 0;
  const builderRank = passport
  ? passport.xp >= 500
    ? "Elite Builder"
    : passport.xp >= 250
    ? "Advanced Builder"
    : passport.xp >= 100
    ? "Active Builder"
    : "New Builder"
  : "";

const builderBadge = passport
  ? passport.xp >= 500
    ? "🟡"
    : passport.xp >= 250
    ? "🟣"
    : passport.xp >= 100
    ? "🔵"
    : "🟢"
  : "";
  const achievements: Achievement[] = passport
  ? [
      {
        title: "First Check-in",
        description: "Complete your first daily check-in",
        unlocked: passport.checkin_xp > 0,
        icon: "✅",
      },
      {
        title: "First Contract",
        description: "Deploy your first smart contract on Arc",
        unlocked: deployments.length >= 1,
        icon: "🏗️",
      },
      {
        title: "Builder I",
        description: "Deploy 3 smart contracts",
        unlocked: deployments.length >= 3,
        icon: "🛠️",
      },
      {
        title: "Arc Explorer",
        description: "Complete at least 10 transactions",
        unlocked: passport.tx_count >= 10,
        icon: "🧭",
      },
      {
        title: "Token Mover",
        description: "Complete at least 10 token transfers",
        unlocked: passport.token_transfers >= 10,
        icon: "💸",
      },
      {
        title: "Streak Starter",
        description: "Build a 3-day check-in streak",
        unlocked: passport.streak >= 3,
        icon: "🔥",
      },
    ]
  : [];
const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
const totalAchievements = achievements.length;
const nextRank =
  passport && passport.xp < 100
    ? "Active Builder"
    : passport && passport.xp < 250
    ? "Advanced Builder"
    : passport && passport.xp < 500
    ? "Elite Builder"
    : "Max Rank";

    const xpToNextRank =
    passport && passport.xp < 100
      ? 100 - passport.xp
      : passport && passport.xp < 250
      ? 250 - passport.xp
      : passport && passport.xp < 500
      ? 500 - passport.xp
      : 0;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
  <div>
    <h1 className="text-4xl font-bold">
      ArcPassport
    </h1>

    <p className="text-gray-400 mt-2">
      Build Your Onchain Legacy on Arc
    </p>
  </div>

  <div className="flex items-center gap-8 text-sm font-medium">
    <a
      href="/"
      className="text-white hover:text-gray-300"
    >
      Passport
    </a>

    <a
      href="/faucet"
      className="text-white hover:text-gray-300"
    >
      Faucet
    </a>

    <a
      href="#leaderboard"
      className="text-white hover:text-gray-300"
    >
      Leaderboard
    </a>
  </div>
</div>
          <p className="text-gray-400 mt-2">
            Build Your Onchain Legacy on Arc
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <ConnectButton />
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Load Passport</h2>

          <input
            className="w-full bg-black border border-zinc-700 rounded-xl p-3"
            placeholder="Enter wallet address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          />

          <button
            onClick={loadPassport}
            disabled={loading || !wallet}
            className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Passport"}
          </button>
        </div>

        {passport && (
          <>
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Arc Passport</h2>
                <p className="text-gray-400 break-all mt-2">
                  {passport.wallet}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-black border border-zinc-800 rounded-full px-4 py-2">
                  <span>{builderBadge}</span>
                  <span className="font-semibold">{builderRank}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Level {passport.level}</span>
                  <span>{xpInLevel}/100 XP to next level</span>
                </div>
                <div className="h-3 bg-black rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card label="Level" value={passport.level} />
                <Card label="XP" value={passport.xp} />
                <Card label="Reputation" value={passport.reputation} />
                <Card label="Builder Rank" value={builderRank} />
                <Card
                  label="Achievements"
                  value={`${unlockedAchievements}/${totalAchievements}`}
                />
                <Card label="Rank" value={`#${passport.rank}`} />
                <Card label="Balance" value={`${passport.balance} USDC`} />
                <Card label="Transactions" value={passport.tx_count} />
                <Card label="Contract Calls" value={passport.contract_calls} />
                <Card label="Token Transfers" value={passport.token_transfers} />
                <Card label="Tokens" value={passport.tokens_count} />
                <Card label="NFTs" value={passport.nft_count} />
                <Card label="Streak" value={`${passport.streak} day`} />
                <Card label="Check-in XP" value={passport.checkin_xp} />
              </div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
    <h2 className="text-2xl font-bold">Builder Profile</h2>

    <div className="grid grid-cols-2 gap-4">
      <Card label="Rank" value={builderRank} />
      <Card label="Builder Score" value={`${passport.xp} XP`} />
      <Card
        label="Contracts"
        value={deployments.length}
      />
      <Card
        label="Achievements"
        value={`${unlockedAchievements}/${totalAchievements}`}
      />
    </div>

    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-400">
        Next Rank
      </p>

      <p className="text-xl font-bold mt-1">
        {nextRank}
      </p>

      {xpToNextRank > 0 && (
        <p className="text-gray-500 mt-1">
          {xpToNextRank} XP remaining
        </p>
      )}
    </div>
  </div>
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Daily Check-in</h2>
                  <p className="text-gray-400 mt-1">
                    Claim daily XP and build your streak.
                  </p>
                </div>

                <button
                  onClick={dailyCheckin}
                  disabled={!passport.checkin_available || checkinLoading}
                  className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
                >
                  {checkinLoading
                    ? "Claiming..."
                    : passport.checkin_available
                    ? "Claim Daily XP"
                    : "Already Claimed"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card label="Current Streak" value={`${passport.streak} day`} />
                <Card
                  label="Status"
                  value={
                    passport.checkin_available
                      ? "Available"
                      : "Claimed Today"
                  }
                />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="text-2xl font-bold">Builder Zone</h2>
              <p className="text-gray-400">
                Deploy your first smart contract on Arc Testnet and earn Builder XP.
              </p>

              <button
                onClick={deployCounterContract}
                disabled={!isConnected || deployPending}
                className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
              >
                {deployPending ? "Deploying..." : "Deploy Counter Contract"}
              </button>

              {!isConnected && (
                <p className="text-sm text-gray-500">
                  Connect your wallet first to deploy a contract.
                </p>
              )}

              {deployHash && (
                <p className="text-sm text-green-400 break-all">
                  Deploy transaction: {deployHash}
                </p>
              )}
              {receipt?.contractAddress && (
                <p className="text-sm text-cyan-400 break-all">
                  Contract: {receipt.contractAddress}
                </p>
              )}
              {deployError && (
                <p className="text-sm text-red-400">
                  Deploy failed: {deployError.message}
                </p>
              )}
            </div>
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
              <h2 className="text-2xl font-bold">Builder Contracts</h2>

              {deployments.length === 0 && (
              <p className="text-gray-500">No contracts deployed yet.</p>
              )}

              <div className="space-y-3">
                {deployments.map((deployment, index) => (
              <div
                key={deployment.tx_hash}
                className="bg-black border border-zinc-800 rounded-xl p-4 space-y-2"
              >
              <p className="text-gray-400">#{index + 1}</p>

              <p className="break-all">
                Contract:{" "}
                <a
                  href={`https://testnet.arcscan.app/address/${deployment.contract_address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300"
                >
                {deployment.contract_address}
                </a>
              </p>

              <p className="break-all">
                Deploy Tx:{" "}
                <a
                  href={`https://testnet.arcscan.app/tx/${deployment.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300"
                >
                {deployment.tx_hash}
                </a>
              </p>

              <p className="text-gray-400">
                Created: {new Date(deployment.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
          </>
        )}
{passport && (
  <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
    <h2 className="text-2xl font-bold">Achievements</h2>

    <div className="grid grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.title}
          className={`rounded-xl p-4 border ${
            achievement.unlocked
              ? "bg-black border-zinc-700"
              : "bg-zinc-950 border-zinc-900 opacity-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{achievement.icon}</span>
            <div>
              <p className="font-bold">{achievement.title}</p>
              <p className="text-sm text-gray-400">
                {achievement.description}
              </p>
            </div>
          </div>

          <p className="text-sm mt-3">
            {achievement.unlocked ? "Unlocked" : "Locked"}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
        <div
          id="leaderboard"
          className="bg-zinc-900 rounded-2xl p-6 space-y-4"
          >
          <h2 className="text-2xl font-bold">Leaderboard</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-sm">
                <tr>
                  <th className="py-3">Rank</th>
                  <th className="py-3">Wallet</th>
                  <th className="py-3">XP</th>
                  <th className="py-3">Streak</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.length === 0 && (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={4}>
                      No leaderboard data yet.
                    </td>
                  </tr>
                )}

                {leaderboard.map((user) => (
                  <tr
                    key={user.wallet}
                    className="border-t border-zinc-800 text-sm"
                  >
                    <td className="py-4">#{user.rank}</td>
                    <td className="py-4 text-gray-300 break-all">
                      {shortWallet(user.wallet)}
                    </td>
                    <td className="py-4">{user.xp}</td>
                    <td className="py-4">{user.streak} day</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {passport && (
          <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 text-sm">
                  <tr>
                    <th className="py-3">Hash</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {passport.recent_transactions.length === 0 && (
                    <tr>
                      <td className="py-4 text-gray-500" colSpan={4}>
                        No transactions found.
                      </td>
                    </tr>
                  )}

                  {passport.recent_transactions.map((tx) => (
                    <tr
                      key={tx.hash}
                      className="border-t border-zinc-800 text-sm"
                    >
                      <td className="py-4 text-blue-300">
                        <a
                          href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {tx.short_hash}
                        </a>
                      </td>
                      <td className="py-4">{tx.type}</td>
                      <td className="py-4">{tx.status}</td>
                      <td className="py-4 text-gray-400">
                        {tx.timestamp
                          ? new Date(tx.timestamp).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({
  label,
  value,
}: {
  label: string | number;
  value: string | number;
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}