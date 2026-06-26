"use client";

import { useCallback, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { Passport } from "@/lib/types";

export function usePassport() {
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  const clearPassport = useCallback(() => {
    setPassport(null);
  }, []);

  const loadPassport = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return null;

    setLoading(true);

    try {
      const data = await apiGet<Passport>(`/passport/${walletAddress}`);
      setPassport(data);
      return data;
    } catch (error) {
      console.error("Failed to load passport:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const dailyCheckin = useCallback(
    async (walletAddress: string) => {
      if (!walletAddress) return null;

      setCheckinLoading(true);

      try {
        const data = await apiPost<{ message: string }>(
          `/checkin/${walletAddress}`
        );
        alert(data.message);
        await loadPassport(walletAddress);
        return data;
      } catch (error) {
        console.error("Failed to check in:", error);
        return null;
      } finally {
        setCheckinLoading(false);
      }
    },
    [loadPassport]
  );

  return {
    passport,
    loading,
    checkinLoading,
    loadPassport,
    dailyCheckin,
    clearPassport,
  };
}
