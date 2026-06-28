"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type {
  Quest,
  QuestClaimResponse,
  QuestListResponse,
  WalletQuestsResponse,
} from "@/lib/types";

export function useQuests(wallet?: string | null) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [summary, setSummary] = useState<WalletQuestsResponse["summary"] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (wallet) {
        const data = await apiGet<WalletQuestsResponse>(`/quests/${wallet}`);
        setQuests(data.quests || []);
        setSummary(data.summary);
        return;
      }

      const data = await apiGet<QuestListResponse>("/quests");
      setQuests(data.quests || []);
      setSummary(null);
    } catch (loadError) {
      console.error("Failed to load quests:", loadError);
      setError("Failed to load quests.");
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    void Promise.resolve().then(() => loadQuests());
  }, [loadQuests]);

  useEffect(() => {
    function handleQuestRefresh() {
      void loadQuests();
    }

    window.addEventListener("arcpassport:quests-refresh", handleQuestRefresh);

    return () => {
      window.removeEventListener(
        "arcpassport:quests-refresh",
        handleQuestRefresh
      );
    };
  }, [loadQuests]);

  const claimQuest = useCallback(
    async (questId: number) => {
      if (!wallet) {
        return null;
      }

      setClaimingQuestId(questId);
      setError(null);

      try {
        const data = await apiPost<QuestClaimResponse>(
          `/quests/${wallet}/claim/${questId}`
        );
        await loadQuests();
        return data;
      } catch (claimError) {
        console.error("Failed to claim quest XP:", claimError);
        setError("Failed to claim quest XP.");
        return null;
      } finally {
        setClaimingQuestId(null);
      }
    },
    [loadQuests, wallet]
  );

  return {
    quests,
    summary,
    loading,
    claimingQuestId,
    error,
    loadQuests,
    claimQuest,
  };
}
