"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { SyncResponse, SyncStatus } from "@/lib/types";

const STALE_SYNC_MS = 60_000;

type SyncStatusIndicatorProps = {
  wallet: string;
  onSynced?: () => Promise<void> | void;
};

export default function SyncStatusIndicator({
  wallet,
  onSynced,
}: SyncStatusIndicatorProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const syncStatus = await apiGet<SyncStatus>(
      `/sync/${encodeURIComponent(wallet)}/status`
    );
    setStatus(syncStatus);
    return syncStatus;
  }, [wallet]);

  const runSyncIfStale = useCallback(async () => {
    try {
      const currentStatus = await loadStatus();

      if (!isSyncStale(currentStatus.last_sync)) {
        return;
      }

      setSyncing(true);
      setMessage(null);
      const result = await apiPost<SyncResponse>(
        `/sync/${encodeURIComponent(wallet)}`
      );
      setStatus({
        wallet,
        last_sync: result.timestamp,
        syncing: false,
        latest_block: result.latest_block,
        network: result.network,
      });
      setMessage(result.cached ? "Using cached Arc data" : null);
      await onSynced?.();
    } catch (error) {
      console.error("Failed to synchronize ArcPassport activity:", error);
      setMessage("Sync unavailable; showing cached dashboard data");
    } finally {
      setSyncing(false);
    }
  }, [loadStatus, onSynced, wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => runSyncIfStale());
  }, [runSyncIfStale]);

  const lastSyncLabel = status?.last_sync
    ? `Synced ${formatRelativeTime(status.last_sync)}`
    : "Sync pending";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-gray-400">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              syncing || status?.syncing ? "bg-blue-400" : "bg-green-400"
            }`}
          />
          <span>{syncing || status?.syncing ? "Syncing Arc activity..." : lastSyncLabel}</span>
        </div>
        <span className="text-xs text-gray-500">
          {status?.latest_block ? `Block ${status.latest_block}` : status?.network ?? "Arc Testnet"}
        </span>
      </div>
      {message && <p className="mt-2 text-xs text-yellow-300">{message}</p>}
    </div>
  );
}

function isSyncStale(lastSync: string | null) {
  if (!lastSync) {
    return true;
  }

  return Date.now() - new Date(lastSync).getTime() > STALE_SYNC_MS;
}

function formatRelativeTime(value: string) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  );

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds} seconds ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minutes ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `${elapsedHours} hours ago`;
}
