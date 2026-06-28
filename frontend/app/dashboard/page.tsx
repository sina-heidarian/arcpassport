"use client";

import Achievements from "@/components/Achievements";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderProfile from "@/components/BuilderProfile";
import BuilderScoreBreakdown from "@/components/BuilderScoreBreakdown";
import BuilderWorkspaceCTA from "@/components/BuilderWorkspaceCTA";
import CircleContractsCard from "@/components/CircleContractsCard";
import CircleWalletsCard from "@/components/CircleWalletsCard";
import Navbar from "@/components/Navbar";
import PassportCard from "@/components/PassportCard";
import PassportNftOwnership from "@/components/PassportNftOwnership";
import { usePassportContext } from "@/components/PassportProvider";
import QuestProgress from "@/components/QuestProgress";
import PublicPassportShare from "@/components/PublicPassportShare";

export default function DashboardPage() {
  const { isConnected, passport, deployments, loading, refreshing, error } =
    usePassportContext();

  const achievements = passport?.achievements ?? [];
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="dashboard" />

        {!isConnected && (
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold">Connect your wallet</h2>
            <p className="text-gray-400 mt-2">
              Connect your wallet to view your ArcPassport dashboard.
            </p>
          </div>
        )}

        {isConnected && loading && (
          <div className="bg-zinc-900 rounded-2xl p-6 text-gray-400">
            Loading your ArcPassport...
          </div>
        )}

        {isConnected && !loading && error && (
          <div className="bg-zinc-900 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {passport && refreshing && (
          <p className="text-sm text-gray-500">Refreshing dashboard...</p>
        )}

        {passport && (
          <>
            <PassportCard
              passport={passport}
              unlockedAchievements={unlockedAchievements}
              totalAchievements={achievements.length}
            />
            <BuilderProfile
              passport={passport}
              contractCount={passport.deployment_count}
              unlockedAchievements={unlockedAchievements}
              totalAchievements={achievements.length}
            />
            <PassportNftOwnership wallet={passport.wallet} compact />
            <BuilderScoreBreakdown breakdown={passport.xp_breakdown} />
            <CircleWalletsCard compact />
            <CircleContractsCard compact />
            <QuestProgress wallet={passport.wallet} />
            <PublicPassportShare wallet={passport.wallet} />
            <BuilderWorkspaceCTA />
            <Achievements achievements={achievements.slice(0, 4)} />
            <BuilderContracts deployments={deployments.slice(0, 3)} />
            <ActivityTimeline
              recentTransactions={passport.recent_transactions.slice(0, 5)}
              deployments={deployments.slice(0, 3)}
              achievements={achievements}
            />
          </>
        )}
      </div>
    </main>
  );
}
