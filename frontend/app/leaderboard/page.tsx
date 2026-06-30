"use client";

import { useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";
import { PageHeader, PageShell } from "@/components/ui";
import { useLeaderboard } from "@/hooks/useLeaderboard";

export default function LeaderboardPage() {
  const { leaderboard, loadLeaderboard } = useLeaderboard();

  useEffect(() => {
    void Promise.resolve().then(() => loadLeaderboard());
  }, [loadLeaderboard]);

  return (
    <PageShell active="leaderboard" width="wide">
        <PageHeader
          title="Builder Leaderboard"
          description="Track top Arc builders by XP, deployments, reputation, achievements, and streak."
        />

        <Leaderboard leaderboard={leaderboard} />
    </PageShell>
  );
}
