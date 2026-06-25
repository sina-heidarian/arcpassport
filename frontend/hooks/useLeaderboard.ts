"use client";

import { useCallback, useState } from "react";
import { apiGet } from "@/lib/api";
import type { LeaderboardUser } from "@/lib/types";

type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
};

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await apiGet<LeaderboardResponse>("/leaderboard");
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, []);

  return { leaderboard, loadLeaderboard };
}
