import type { Passport } from "@/lib/types";

type BuilderScoreBreakdownProps = {
  breakdown: Passport["xp_breakdown"];
};

const labels = [
  { key: "onchain_xp", label: "Onchain Activity XP" },
  { key: "deployment_xp", label: "Deployment XP" },
  { key: "checkin_xp", label: "Check-in XP" },
  { key: "total_xp", label: "Total XP" },
] as const;

export default function BuilderScoreBreakdown({
  breakdown,
}: BuilderScoreBreakdownProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Builder Score Breakdown</h2>
        <p className="text-gray-400 mt-1">
          See exactly where this Builder XP comes from.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {labels.map((item) => (
          <div
            key={item.key}
            className="bg-black border border-zinc-800 rounded-xl p-4"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{breakdown[item.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
