import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Quest } from "@/lib/types";

type QuestCardProps = {
  quest: Quest;
  compact?: boolean;
  onClaim?: (questId: number) => void;
  claiming?: boolean;
};

export default function QuestCard({
  quest,
  compact,
  onClaim,
  claiming,
}: QuestCardProps) {
  const status = quest.status ?? "locked";
  const completed = quest.completed || status === "completed";
  const claimable = Boolean(quest.claimable && !completed);
  const locked = status === "locked" && !claimable && !completed;
  const target = quest.target ?? quest.requirement_value;
  const progress = completed ? target : quest.progress ?? 0;
  const percentage = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  const difficulty = getDifficulty(quest);
  const reward = getRewardLabel(quest);
  const icon = getQuestIcon(quest);

  return (
    <Card className={cardClassName({ completed, claimable, locked })}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className={iconClassName({ completed, claimable, locked })}>
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "text-heading font-bold text-white",
                  compact ? "text-lg" : "text-xl"
                )}
              >
                {quest.title}
              </h3>
              <Badge>{quest.category}</Badge>
              <Badge tone={difficultyTone(difficulty)}>{difficulty}</Badge>
              {completed && <Badge tone="green">Claimed</Badge>}
              {claimable && <Badge tone="yellow">Ready</Badge>}
              {locked && <Badge>Locked</Badge>}
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              {quest.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className={rewardClassName({ completed, claimable, locked })}>
              +{quest.xp_reward} XP
            </p>
            <p className="mt-1 text-xs text-gray-500">{reward}</p>
          </div>
        </div>

        {!completed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span className="font-mono">
                {claimable ? target : progress}/{target}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  claimable
                    ? "bg-gradient-to-r from-yellow-300 to-amber-500"
                    : locked
                      ? "bg-zinc-700"
                      : "bg-gradient-to-r from-blue-400 to-cyan-300"
                )}
                style={{ width: `${claimable ? 100 : percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-3 text-xs sm:min-w-[340px]">
            <QuestMeta label="XP" value={quest.xp_reward} />
            <QuestMeta label="Reward" value={reward} />
            <QuestMeta label="Status" value={statusLabel({ completed, claimable, locked })} />
          </div>

          {claimable && onClaim && (
            <Button
              type="button"
              onClick={() => onClaim(quest.id)}
              disabled={claiming}
              className="bg-yellow-300 text-black hover:bg-yellow-200"
            >
              {claiming ? "Claiming..." : "Claim XP"}
            </Button>
          )}

          {completed && (
            <div className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-200">
              Reward claimed
            </div>
          )}

          {!claimable && !completed && (
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300">
              {locked ? "Quest locked" : "In progress"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function QuestMeta({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
      <p className="text-gray-500">{label}</p>
      <p className="font-mono mt-1 font-semibold text-gray-100">{value}</p>
    </div>
  );
}

function cardClassName({
  completed,
  claimable,
  locked,
}: {
  completed: boolean;
  claimable: boolean;
  locked: boolean;
}) {
  if (completed) {
    return "border-green-400/30 bg-gradient-to-br from-green-400/10 via-zinc-950 to-zinc-950 shadow-[0_0_45px_rgba(34,197,94,0.12)]";
  }

  if (claimable) {
    return "border-yellow-300/40 bg-gradient-to-br from-yellow-300/10 via-zinc-950 to-zinc-950 shadow-[0_0_55px_rgba(250,204,21,0.16)]";
  }

  if (locked) {
    return "border-zinc-800 bg-zinc-950/70 opacity-70";
  }

  return "border-blue-400/30 bg-gradient-to-br from-blue-500/10 via-zinc-950 to-zinc-950 shadow-[0_0_45px_rgba(59,130,246,0.12)]";
}

function iconClassName({
  completed,
  claimable,
  locked,
}: {
  completed: boolean;
  claimable: boolean;
  locked: boolean;
}) {
  return cn(
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold",
    completed && "border-green-400/30 bg-green-400/10 text-green-200",
    claimable && "border-yellow-300/40 bg-yellow-300/10 text-yellow-100",
    locked && "border-zinc-700 bg-zinc-900 text-gray-500",
    !completed && !claimable && !locked && "border-blue-400/30 bg-blue-400/10 text-blue-200"
  );
}

function rewardClassName({
  completed,
  claimable,
  locked,
}: {
  completed: boolean;
  claimable: boolean;
  locked: boolean;
}) {
  if (completed) return "font-mono text-lg font-bold text-green-200";
  if (claimable) return "font-mono text-xl font-bold text-yellow-100";
  if (locked) return "font-mono text-lg font-bold text-gray-500";
  return "font-mono text-xl font-bold text-white";
}

function statusLabel({
  completed,
  claimable,
  locked,
}: {
  completed: boolean;
  claimable: boolean;
  locked: boolean;
}) {
  if (completed) return "Claimed";
  if (claimable) return "Claimable";
  if (locked) return "Locked";
  return "Active";
}

function getDifficulty(quest: Quest) {
  if (quest.requirement_value >= 30 || quest.xp_reward >= 100) return "Hard";
  if (quest.requirement_value >= 7 || quest.xp_reward >= 50) return "Medium";
  return "Easy";
}

function difficultyTone(difficulty: string) {
  if (difficulty === "Hard") return "red";
  if (difficulty === "Medium") return "yellow";
  return "blue";
}

function getRewardLabel(quest: Quest) {
  if (quest.xp_reward >= 100) return "Major XP";
  if (quest.xp_reward >= 50) return "Bonus XP";
  return "Starter XP";
}

function getQuestIcon(quest: Quest) {
  const icons: Record<string, string> = {
    first_transaction: "TX",
    first_deployment: "D1",
    deploy_3_contracts: "D3",
    claim_faucet: "US",
    mint_passport: "SBT",
    daily_checkin: "DAY",
    streak_7: "S7",
    streak_30: "S30",
  };

  return icons[quest.requirement_type] ?? quest.category.slice(0, 2).toUpperCase();
}
