"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { apiGet } from "@/lib/api";
import type {
  Deployment,
  LeaderboardUser,
  Passport,
  PlatformStats,
} from "@/lib/types";

const STALE_TIME_MS = 60_000;

type DeploymentsResponse = {
  deployments: Deployment[];
};

type PassportContextValue = {
  wallet: string | null;
  isConnected: boolean;
  passport: Passport | null;
  deployments: Deployment[];
  leaderboard: LeaderboardUser[];
  stats: PlatformStats | null;
  lastLoadedAt: number | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshPassport: (force?: boolean) => Promise<void>;
  clearPassport: () => void;
  setCachedLeaderboard: (leaderboard: LeaderboardUser[]) => void;
  setCachedStats: (stats: PlatformStats | null) => void;
};

const PassportContext = createContext<PassportContextValue | null>(null);

export function PassportProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [wallet, setWallet] = useState<string | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearPassport = useCallback(() => {
    setWallet(null);
    setPassport(null);
    setDeployments([]);
    setLastLoadedAt(null);
    setLoading(false);
    setRefreshing(false);
    setError(null);
  }, []);

  const refreshPassport = useCallback(
    async (force = false) => {
      if (!isConnected || !address) {
        clearPassport();
        return;
      }

      const normalizedWallet = address.toLowerCase();
      const now = Date.now();
      const isSameWallet = wallet === normalizedWallet;
      const isFresh = lastLoadedAt ? now - lastLoadedAt < STALE_TIME_MS : false;

      if (!force && isSameWallet && isFresh && passport) {
        return;
      }

      setWallet(normalizedWallet);
      setError(null);
      setLoading(!passport || !isSameWallet);
      setRefreshing(Boolean(passport && isSameWallet));

      try {
        const [passportData, deploymentsData] = await Promise.all([
          apiGet<Passport>(`/passport/${address}`),
          apiGet<DeploymentsResponse>(`/deployments/${address}`),
        ]);

        setPassport(passportData);
        setDeployments(deploymentsData.deployments || []);
        setLastLoadedAt(Date.now());
      } catch (loadError) {
        console.error("Failed to refresh connected passport:", loadError);
        setError("Failed to load ArcPassport data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [address, clearPassport, isConnected, lastLoadedAt, passport, wallet]
  );

  useEffect(() => {
    if (isConnected && address) {
      void Promise.resolve().then(() => refreshPassport());
      return;
    }

    void Promise.resolve().then(() => clearPassport());
  }, [address, clearPassport, isConnected, refreshPassport]);

  const value = useMemo(
    () => ({
      wallet,
      isConnected,
      passport,
      deployments,
      leaderboard,
      stats,
      lastLoadedAt,
      loading,
      refreshing,
      error,
      refreshPassport,
      clearPassport,
      setCachedLeaderboard: setLeaderboard,
      setCachedStats: setStats,
    }),
    [
      wallet,
      isConnected,
      passport,
      deployments,
      leaderboard,
      stats,
      lastLoadedAt,
      loading,
      refreshing,
      error,
      refreshPassport,
      clearPassport,
    ]
  );

  return (
    <PassportContext.Provider value={value}>
      {children}
    </PassportContext.Provider>
  );
}

export function usePassportContext() {
  const context = useContext(PassportContext);

  if (!context) {
    throw new Error("usePassportContext must be used inside PassportProvider");
  }

  return context;
}
