"use client";

import Link from "next/link";
import { usePassportContext } from "@/components/PassportProvider";
import QuestCard from "@/components/QuestCard";
import { useQuests } from "@/hooks/useQuests";

export default function TodaysQuest() {
  const { wallet, refreshPassport } = usePassportContext();
  const { quests, loading, claimingQuestId, error, claimQuest } = useQuests(wallet);
  const quest =
    quests.find((item) => item.requirement_type === "daily_checkin") ??
    quests[0];

  async function handleClaim(questId: number) {
    const result = await claimQuest(questId);

    if (result) {
      await refreshPassport(true);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today&apos;s Quest</h2>
          <p className="text-sm text-gray-400">
            A focused builder goal for the next useful action.
          </p>
        </div>
        <Link href="/quests" className="text-sm text-blue-400 hover:text-blue-300">
          View all quests
        </Link>
      </div>

      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-gray-400">
          Loading quest...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && quest && (
        <QuestCard
          quest={quest}
          compact
          onClaim={handleClaim}
          claiming={claimingQuestId === quest.id}
        />
      )}
    </section>
  );
}
