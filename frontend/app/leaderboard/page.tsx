"use client";

import { useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";
import Navbar from "@/components/Navbar";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { leaderboard, loadLeaderboard } = useLeaderboard();

  useEffect(() => {
    void Promise.resolve().then(() => loadLeaderboard());
  }, [loadLeaderboard]);

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="leaderboard" />

        <section className="space-y-3">
          <h2 className="text-3xl font-bold">Builder Leaderboard</h2>
          <p className="max-w-2xl text-gray-400">
            Track Arc builders by total XP, deployments, achievements, and
            streak.
          </p>
        </section>

        <Leaderboard leaderboard={leaderboard} />
      </div>
    </main>
  );
}
