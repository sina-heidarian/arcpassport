"use client";

import { useMemo } from "react";
import { usePassportContext } from "@/components/PassportProvider";
import QuestCard from "@/components/QuestCard";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  PageShell,
  Skeleton,
  StatCard,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Quest } from "@/lib/types";
import { useQuests } from "@/hooks/useQuests";

type QuestChapter = {
  id: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  quests: Quest[];
};

const chapterOrder = [
  "Getting Started",
  "Builder",
  "Deployments",
  "Community",
  "Advanced",
];

export default function QuestsPage() {
  const { wallet, isConnected, refreshPassport } = usePassportContext();
  const { quests, summary, loading, claimingQuestId, error, claimQuest } =
    useQuests(wallet);

  const chapters = useMemo(() => buildChapters(quests), [quests]);

  async function handleClaim(questId: number) {
    const result = await claimQuest(questId);

    if (result) {
      await refreshPassport(true);
    }
  }

  return (
    <PageShell active="quests">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-400/20 bg-zinc-950 p-6 shadow-[0_24px_100px_rgba(37,99,235,0.14)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(14,165,233,0.12),transparent_30%)]" />
        <div className="relative">
          <PageHeader
            eyebrow="Quest Engine"
            title="Builder Quests"
            description="Complete chapters, claim XP, and turn builder progress into ArcPassport reputation."
            actions={
              !isConnected ? (
                <Badge tone="yellow">Connect wallet to track progress</Badge>
              ) : (
                <Badge tone="blue">Progress tracking active</Badge>
              )
            }
          />
        </div>
      </section>

      {isConnected && summary && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Total" value={summary.total} />
          <StatCard label="Completed" value={summary.completed} highlight={summary.completed > 0} />
          <StatCard label="In Progress" value={summary.in_progress} />
          <StatCard label="Locked" value={summary.locked} />
          <StatCard
            label="Quest XP Claimed"
            value={summary.total_xp_completed}
            highlight={summary.total_xp_completed > 0}
          />
        </section>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      )}

      {!loading && error && <Card className="text-red-300">{error}</Card>}

      {!loading && !error && quests.length === 0 && (
        <EmptyState title="No quests available yet." />
      )}

      {!loading && !error && quests.length > 0 && (
        <section className="space-y-8">
          {chapters.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              onClaim={isConnected ? handleClaim : undefined}
              claimingQuestId={claimingQuestId}
            />
          ))}
        </section>
      )}
    </PageShell>
  );
}

function ChapterSection({
  chapter,
  onClaim,
  claimingQuestId,
}: {
  chapter: QuestChapter;
  onClaim?: (questId: number) => void;
  claimingQuestId: number | null;
}) {
  const completed = chapter.quests.filter(
    (quest) => quest.completed || quest.status === "completed"
  ).length;
  const total = chapter.quests.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden p-0" variant="elevated">
      <div className={cn("border-b border-white/10 p-6", chapter.accent)}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sm font-bold text-white">
              {chapter.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/70">
                Chapter
              </p>
              <h2 className="text-heading mt-1 text-2xl font-bold text-white">
                {chapter.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                {chapter.description}
              </p>
            </div>
          </div>

          <div className="min-w-[180px]">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Chapter Progress</span>
              <span className="font-mono">{completed}/{total}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 lg:p-5">
        {chapter.quests.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onClaim={onClaim}
            claiming={claimingQuestId === quest.id}
          />
        ))}
      </div>
    </Card>
  );
}

function buildChapters(quests: Quest[]) {
  const grouped = new Map<string, Quest[]>();

  for (const name of chapterOrder) {
    grouped.set(name, []);
  }

  for (const quest of quests) {
    const chapter = getQuestChapter(quest);
    grouped.set(chapter, [...(grouped.get(chapter) ?? []), quest]);
  }

  return chapterOrder.map((title) => ({
    id: title.toLowerCase().replace(/\s+/g, "-"),
    title,
    description: getChapterDescription(title),
    icon: getChapterIcon(title),
    accent: getChapterAccent(title),
    quests: grouped.get(title) ?? [],
  }));
}

function getQuestChapter(quest: Quest) {
  if (
    ["first_transaction", "claim_faucet", "daily_checkin"].includes(
      quest.requirement_type
    )
  ) {
    return "Getting Started";
  }

  if (
    ["first_deployment", "deploy_3_contracts"].includes(quest.requirement_type)
  ) {
    return "Deployments";
  }

  if (quest.category === "Social") {
    return "Community";
  }

  if (["streak_7", "streak_30", "mint_passport"].includes(quest.requirement_type)) {
    return "Advanced";
  }

  return "Builder";
}

function getChapterDescription(title: string) {
  const descriptions: Record<string, string> = {
    "Getting Started": "Begin your Arc journey with the first actions that unlock momentum.",
    Builder: "Build habits, prove activity, and grow your ArcPassport foundation.",
    Deployments: "Ship contracts and turn deployed work into visible builder progress.",
    Community: "Connect your identity with social and ecosystem milestones.",
    Advanced: "Longer challenges for builders building sustained reputation.",
  };

  return descriptions[title];
}

function getChapterIcon(title: string) {
  const icons: Record<string, string> = {
    "Getting Started": "GS",
    Builder: "BD",
    Deployments: "DP",
    Community: "CM",
    Advanced: "ADV",
  };

  return icons[title];
}

function getChapterAccent(title: string) {
  const accents: Record<string, string> = {
    "Getting Started":
      "bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.24),transparent_34%)]",
    Builder:
      "bg-[radial-gradient(circle_at_12%_20%,rgba(14,165,233,0.20),transparent_34%)]",
    Deployments:
      "bg-[radial-gradient(circle_at_12%_20%,rgba(168,85,247,0.18),transparent_34%)]",
    Community:
      "bg-[radial-gradient(circle_at_12%_20%,rgba(34,197,94,0.18),transparent_34%)]",
    Advanced:
      "bg-[radial-gradient(circle_at_12%_20%,rgba(250,204,21,0.16),transparent_34%)]",
  };

  return accents[title];
}
