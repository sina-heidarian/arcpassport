import type { Quest } from "@/lib/types";

type QuestCardProps = {
  quest: Quest;
  compact?: boolean;
  onClaim?: (questId: number) => void;
  claiming?: boolean;
};

const statusStyles = {
  completed: "border-green-700 bg-green-950/40 text-green-300",
  in_progress: "border-blue-700 bg-blue-950/40 text-blue-300",
  locked: "border-zinc-800 bg-zinc-950 text-gray-400",
};

export default function QuestCard({
  quest,
  compact,
  onClaim,
  claiming,
}: QuestCardProps) {
  const status = quest.status ?? "locked";
  const progress = quest.progress ?? 0;
  const target = quest.target ?? quest.requirement_value;
  const percent = target > 0 ? Math.min(100, (progress / target) * 100) : 0;

  return (
    <div className={`rounded-2xl border p-5 ${statusStyles[status]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={compact ? "text-lg font-bold" : "text-xl font-bold"}>
              {quest.title}
            </h3>
            <span className="rounded-full border border-current px-2 py-0.5 text-xs">
              {quest.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-300">{quest.description}</p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-sm font-semibold">{statusLabel(status)}</p>
          <p className="text-sm text-gray-300">{quest.xp_reward} XP</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>
            {progress}/{target}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black">
          <div
            className={status === "completed" ? "h-full bg-green-400" : "h-full bg-blue-400"}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        {quest.claimable && onClaim && (
          <button
            type="button"
            onClick={() => onClaim(quest.id)}
            disabled={claiming}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {claiming ? "Claiming..." : "Claim XP"}
          </button>
        )}

        {quest.completed && (
          <span className="inline-flex rounded-xl border border-green-700 px-4 py-2 text-sm font-medium text-green-300">
            Claimed
          </span>
        )}

        {!quest.claimable && !quest.completed && (
          <span className="inline-flex rounded-xl border border-current px-4 py-2 text-sm font-medium">
            {statusLabel(status)}
          </span>
        )}
      </div>
    </div>
  );
}

function statusLabel(status: NonNullable<Quest["status"]>) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Locked";
}
