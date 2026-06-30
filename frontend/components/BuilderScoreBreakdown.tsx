import { Card, StatCard } from "@/components/ui";
import type { Passport } from "@/lib/types";

type BuilderScoreBreakdownProps = {
  breakdown: Passport["xp_breakdown"];
};

const labels = [
  { key: "onchain_xp", label: "Onchain Activity XP" },
  { key: "deployment_xp", label: "Deployment XP" },
  { key: "checkin_xp", label: "Check-in XP" },
  { key: "quest_xp", label: "Quest XP" },
  { key: "total_xp", label: "Total XP" },
] as const;

export default function BuilderScoreBreakdown({
  breakdown,
}: BuilderScoreBreakdownProps) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Builder Score Breakdown</h2>
        <p className="text-gray-400 mt-1">
          See exactly where this Builder XP comes from.
        </p>
      </div>

      {breakdown.quest_xp > 0 && (
        <Card className="border-green-800 bg-green-950/30">
          <p className="text-sm font-medium text-green-300">Quest XP earned</p>
          <p className="font-mono mt-1 text-3xl font-bold text-white">
            {breakdown.quest_xp}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {labels.map((item) => (
          <StatCard key={item.key} label={item.label} value={breakdown[item.key]} />
        ))}
      </div>
    </Card>
  );
}
