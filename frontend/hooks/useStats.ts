"use client";

import { useCallback, useEffect } from "react";
import { usePassportContext } from "@/components/PassportProvider";
import { apiGet } from "@/lib/api";
import type { PlatformStats } from "@/lib/types";

export function useStats() {
  const { stats, setCachedStats } = usePassportContext();

  const loadStats = useCallback(async (force = false) => {
    if (!force && stats) {
      return;
    }

    try {
      const data = await apiGet<PlatformStats>("/stats");
      setCachedStats(data);
    } catch (error) {
      console.error("Failed to load platform stats:", error);
    }
  }, [setCachedStats, stats]);

  useEffect(() => {
    void Promise.resolve().then(() => loadStats());
  }, [loadStats]);

  return { stats, loadStats };
}
