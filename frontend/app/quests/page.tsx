"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { usePassportContext } from "@/components/PassportProvider";
import QuestCard from "@/components/QuestCard";
import { useQuests } from "@/hooks/useQuests";

const filters = ["All", "Onchain", "Deploy", "Builder", "Learning", "Social"];

export default function QuestsPage() {
  const { wallet, isConnected, refreshPassport } = usePassportContext();
  const {
    quests,
    summary,
    loading,
    claimingQuestId,
    error,
    claimQuest,
  } = useQuests(wallet);
  const [activeFilter, setActiveFilter] = useState("All");
  const filteredQuests = useMemo(
    () =>
      activeFilter === "All"
        ? quests
        : quests.filter((quest) => quest.category === activeFilter),
    [activeFilter, quests]
  );

  async function handleClaim(questId: number) {
    const result = await claimQuest(questId);

    if (result) {
      await refreshPassport(true);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="quests" />

        <section className="space-y-3">
          <h2 className="text-3xl font-bold">Builder Quests</h2>
          <p className="max-w-2xl text-gray-400">
            Complete builder tasks to earn XP and grow your ArcPassport.
          </p>
          {!isConnected && (
            <p className="text-sm text-yellow-300">
              Connect wallet to track quest progress.
            </p>
          )}
        </section>

        <section className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-zinc-900 text-gray-300 hover:border-zinc-500"
              }`}
            >
              {filter}
            </button>
          ))}
        </section>

        {isConnected && summary && (
          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <SummaryItem label="Total" value={summary.total} />
            <SummaryItem label="Completed" value={summary.completed} />
            <SummaryItem label="In Progress" value={summary.in_progress} />
            <SummaryItem label="Locked" value={summary.locked} />
            <SummaryItem
              label="Quest XP Claimed"
              value={summary.total_xp_completed}
              highlight={summary.total_xp_completed > 0}
            />
          </section>
        )}

        {loading && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-gray-400">
            Loading quests...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="grid grid-cols-1 gap-4">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={isConnected ? handleClaim : undefined}
                claiming={claimingQuestId === quest.id}
              />
            ))}
            {filteredQuests.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-gray-400">
                No {activeFilter.toLowerCase()} quests yet.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-green-800 bg-green-950/30"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <p className={highlight ? "text-xs text-green-300" : "text-xs text-gray-500"}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
