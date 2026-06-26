"use client";

import { useCallback } from "react";
import { usePassportContext } from "@/components/PassportProvider";
import { apiGet } from "@/lib/api";
import type { LeaderboardUser } from "@/lib/types";

type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
};

export function useLeaderboard() {
  const { leaderboard, setCachedLeaderboard } = usePassportContext();

  const loadLeaderboard = useCallback(async (force = false) => {
    if (!force && leaderboard.length > 0) {
      return;
    }

    try {
      const data = await apiGet<LeaderboardResponse>("/leaderboard");
      setCachedLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  }, [leaderboard.length, setCachedLeaderboard]);

  return { leaderboard, loadLeaderboard };
}
