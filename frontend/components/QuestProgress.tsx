"use client";

import Link from "next/link";
import { usePassportContext } from "@/components/PassportProvider";
import QuestCard from "@/components/QuestCard";
import { useQuests } from "@/hooks/useQuests";

type QuestProgressProps = {
  wallet: string;
};

export default function QuestProgress({ wallet }: QuestProgressProps) {
  const { refreshPassport } = usePassportContext();
  const { quests, summary, loading, claimingQuestId, error, claimQuest } =
    useQuests(wallet);
  const nextQuest =
    quests.find((quest) => quest.status === "in_progress") ??
    quests.find((quest) => quest.status === "locked") ??
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
          <h2 className="text-2xl font-bold">Next Quest</h2>
          <p className="text-sm text-gray-400">
            One recommended builder goal to keep momentum.
          </p>
        </div>
        <Link href="/quests" className="text-sm text-blue-400 hover:text-blue-300">
          View all quests
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryItem label="Completed" value={summary.completed} />
          <SummaryItem label="In Progress" value={summary.in_progress} />
          <SummaryItem label="Locked" value={summary.locked} />
          <SummaryItem label="Quest XP Claimed" value={summary.total_xp_completed} />
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-gray-400">
          Loading quest progress...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && nextQuest && (
        <QuestCard
          quest={nextQuest}
          compact
          onClaim={handleClaim}
          claiming={claimingQuestId === nextQuest.id}
        />
      )}
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
