"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import Achievements from "@/components/Achievements";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderProfile from "@/components/BuilderProfile";
import DailyCheckin from "@/components/DailyCheckin";
import DeployCard from "@/components/DeployCard";
import Leaderboard from "@/components/Leaderboard";
import Navbar from "@/components/Navbar";
import PassportCard from "@/components/PassportCard";
import RecentTransactions from "@/components/RecentTransactions";
import WalletCard from "@/components/WalletCard";
import { useDeployments } from "@/hooks/useDeployments";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { usePassport } from "@/hooks/usePassport";
import { apiPost } from "@/lib/api";
import { getAchievements } from "@/lib/builder";
import { counterAbi, counterBytecode } from "@/lib/counterContract";

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

  const [wallet, setWallet] = useState("");
  const { passport, loading, checkinLoading, loadPassport, dailyCheckin } =
    usePassport();
  const { leaderboard, loadLeaderboard } = useLeaderboard();
  const { deployments, loadDeployments } = useDeployments();
  const activeWallet = wallet || (isConnected && address ? address : "");

  const achievements = useMemo(
    () => (passport ? getAchievements(passport, deployments) : []),
    [passport, deployments]
  );
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const refreshBuilder = useCallback(
    async (walletAddress: string) => {
      await loadPassport(walletAddress);
      await loadDeployments(walletAddress);
      await loadLeaderboard();
    },
    [loadDeployments, loadLeaderboard, loadPassport]
  );

  function deployCounterContract() {
    deployContract({
      abi: counterAbi,
      bytecode: counterBytecode,
    });
  }

  useEffect(() => {
    void Promise.resolve().then(loadLeaderboard);
  }, [loadLeaderboard]);

  useEffect(() => {
    async function saveDeployment() {
      if (!receipt?.contractAddress || !deployHash || !address) {
        return;
      }

      try {
        await apiPost("/deployment", {
          wallet: address,
          contract_address: receipt.contractAddress,
          tx_hash: deployHash,
        });

        alert("Builder XP +100 awarded!");
        await refreshBuilder(address);
      } catch (error) {
        console.error("Failed to save deployment:", error);
      }
    }

    saveDeployment();
  }, [receipt, deployHash, address, refreshBuilder]);

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="passport" />

        <WalletCard
          wallet={activeWallet}
          loading={loading}
          onWalletChange={setWallet}
          onLoadPassport={() => refreshBuilder(activeWallet)}
        />

        {passport && (
          <>
            <PassportCard
              passport={passport}
              unlockedAchievements={unlockedAchievements}
              totalAchievements={achievements.length}
            />
            <BuilderProfile
              passport={passport}
              contractCount={deployments.length}
              unlockedAchievements={unlockedAchievements}
              totalAchievements={achievements.length}
            />
            <DailyCheckin
              passport={passport}
              checkinLoading={checkinLoading}
              onCheckin={async () => {
                await dailyCheckin(passport.wallet);
                await loadLeaderboard();
              }}
            />
            <DeployCard
              isConnected={isConnected}
              deployPending={deployPending}
              deployHash={deployHash}
              contractAddress={receipt?.contractAddress ?? undefined}
              deployError={deployError}
              onDeploy={deployCounterContract}
            />
            <BuilderContracts deployments={deployments} />
            <Achievements achievements={achievements} />
          </>
        )}

        <Leaderboard leaderboard={leaderboard} />

        {passport && (
          <RecentTransactions transactions={passport.recent_transactions} />
        )}
      </div>
    </main>
  );
}
