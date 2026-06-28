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
  const percent = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
  const showProgress = !completed;

  return (
    <div className={cardClassName({ completed, claimable, locked })}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={compact ? "text-lg font-bold" : "text-xl font-bold"}>
              {quest.title}
            </h3>
            <span className="rounded-full border border-current px-2 py-0.5 text-xs">
              {quest.category}
            </span>
            {completed && (
              <span className="rounded-full border border-green-700 bg-green-950/40 px-2 py-0.5 text-xs font-semibold text-green-300">
                ✓ Claimed
              </span>
            )}
            {claimable && (
              <span className="rounded-full border border-yellow-600 bg-yellow-950/40 px-2 py-0.5 text-xs font-semibold text-yellow-200">
                Claimable
              </span>
            )}
            {locked && (
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-gray-400">
                Locked
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-300">{quest.description}</p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className={rewardClassName({ completed, claimable, locked })}>
            +{quest.xp_reward} XP
          </p>
          <p className="text-xs text-gray-500">{statusLabel({ completed, claimable, locked })}</p>
        </div>
      </div>

      {showProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>
              {progress}/{target}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black">
            <div
              className={claimable ? "h-full bg-yellow-400" : "h-full bg-blue-400"}
              style={{ width: `${claimable ? 100 : percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        {claimable && onClaim && (
          <button
            type="button"
            onClick={() => onClaim(quest.id)}
            disabled={claiming}
            className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {claiming ? "Claiming..." : "Claim XP"}
          </button>
        )}

        {completed && (
          <span className="inline-flex rounded-xl border border-green-700 px-3 py-1 text-xs font-medium text-green-300">
            ✓ Claimed
          </span>
        )}

        {!claimable && !completed && (
          <span className="inline-flex rounded-xl border border-current px-4 py-2 text-sm font-medium text-gray-300">
            {locked ? "Locked" : "In Progress"}
          </span>
        )}
      </div>
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
  const base = "rounded-2xl border bg-zinc-900 p-5";

  if (completed) {
    return `${base} border-green-800/70`;
  }

  if (claimable) {
    return `${base} border-yellow-600/80 shadow-[0_0_0_1px_rgba(250,204,21,0.18)]`;
  }

  if (locked) {
    return `${base} border-zinc-800 opacity-60`;
  }

  return `${base} border-blue-800/70`;
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
  if (completed) {
    return "text-sm font-semibold text-green-300";
  }

  if (claimable) {
    return "text-xl font-bold text-yellow-200";
  }

  if (locked) {
    return "text-sm font-semibold text-gray-500";
  }

  return "text-xl font-bold text-white";
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
  if (claimable) return "Ready to claim";
  if (locked) return "Locked";
  return "In Progress";
}
