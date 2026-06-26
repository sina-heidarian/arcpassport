import { shortWallet } from "@/lib/builder";
import type { PlatformStats } from "@/lib/types";

type GlobalStatsProps = {
  stats: PlatformStats | null;
};

export default function GlobalStats({ stats }: GlobalStatsProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Platform Overview</h2>
        <p className="text-gray-400 mt-1">
          High-level ArcPassport builder activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Builders" value={stats?.total_builders ?? 0} />
        <StatCard label="Deployments" value={stats?.total_deployments ?? 0} />
        <StatCard label="Check-in XP" value={stats?.total_checkin_xp ?? 0} />
        <StatCard
          label="Top Builder"
          value={
            stats?.top_builder.wallet
              ? `${shortWallet(stats.top_builder.wallet)} · ${stats.top_builder.xp} XP`
              : "None yet"
          }
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1 break-all">{value}</p>
    </div>
  );
}
