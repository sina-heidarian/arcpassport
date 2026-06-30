"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, StatCard } from "@/components/ui";
import { shortWallet } from "@/lib/builder";
import { cn } from "@/lib/cn";
import type { LeaderboardUser } from "@/lib/types";

type LeaderboardProps = {
  leaderboard: LeaderboardUser[];
};

type PeriodFilter = "Weekly" | "Monthly" | "All Time";
type MetricFilter = "XP" | "Deployments" | "Reputation";

const periods: PeriodFilter[] = ["Weekly", "Monthly", "All Time"];
const metrics: MetricFilter[] = ["XP", "Deployments", "Reputation"];

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("All Time");
  const [metric, setMetric] = useState<MetricFilter>("XP");

  const rankedBuilders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...leaderboard]
      .filter((builder) => {
        if (!query) return true;
        return (
          builder.wallet.toLowerCase().includes(query) ||
          builder.builder_rank.toLowerCase().includes(query)
        );
      })
      .sort((first, second) => {
        const firstValue = metricValue(first, metric);
        const secondValue = metricValue(second, metric);

        if (secondValue !== firstValue) {
          return secondValue - firstValue;
        }

        return first.rank - second.rank;
      });
  }, [leaderboard, metric, search]);

  const podium = rankedBuilders.slice(0, 3);
  const tableBuilders = rankedBuilders.slice(3);
  const totalXp = leaderboard.reduce((sum, builder) => sum + builder.xp, 0);
  const totalDeployments = leaderboard.reduce(
    (sum, builder) => sum + builder.deployment_count,
    0
  );
  const totalReputation = leaderboard.reduce(
    (sum, builder) => sum + reputationScore(builder),
    0
  );

  if (leaderboard.length === 0) {
    return (
      <EmptyState
        title="No leaderboard data yet."
        description="Builders will appear here after passports are loaded and activity is synced."
      />
    );
  }

  return (
    <div id="leaderboard" className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total XP" value={totalXp} highlight={totalXp > 0} />
        <StatCard label="Deployments" value={totalDeployments} />
        <StatCard label="Reputation" value={totalReputation} />
      </section>

      <section className="relative overflow-hidden rounded-[32px] border border-blue-400/20 bg-zinc-950 p-6 shadow-[0_28px_120px_rgba(37,99,235,0.16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.24),transparent_38%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-col gap-2 text-center">
            <Badge tone="blue" className="mx-auto">Podium</Badge>
            <h2 className="text-heading text-3xl font-bold text-white">
              Top Arc Builders
            </h2>
            <p className="text-sm text-gray-400">
              The current leaderboard snapshot, ranked by {metric.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-end">
            <PodiumCard builder={podium[1]} place={2} />
            <PodiumCard builder={podium[0]} place={1} featured />
            <PodiumCard builder={podium[2]} place={3} />
          </div>
        </div>
      </section>

      <Card className="space-y-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
          <div>
            <label className="text-label text-gray-500" htmlFor="leaderboard-search">
              Search Builders
            </label>
            <input
              id="leaderboard-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wallet or builder rank"
              className="font-mono mt-2 w-full rounded-2xl border border-zinc-800 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
            />
          </div>

          <FilterGroup
            label="Period"
            options={periods}
            active={period}
            onSelect={setPeriod}
          />

          <FilterGroup
            label="Rank By"
            options={metrics}
            active={metric}
            onSelect={setMetric}
          />
        </div>

        <div className="rounded-2xl border border-blue-400/10 bg-blue-400/5 px-4 py-3 text-sm text-blue-100/80">
          {period} view is using the current leaderboard snapshot. Rank badges
          animate when search or filters change.
        </div>
      </Card>

      <section className="space-y-3">
        {rankedBuilders.length === 0 ? (
          <EmptyState
            title="No builders match your search."
            description="Try searching by a wallet fragment or builder rank."
          />
        ) : (
          <>
            {tableBuilders.map((builder, index) => (
              <BuilderRow
                key={builder.wallet}
                builder={builder}
                displayRank={index + 4}
                metric={metric}
              />
            ))}
            {tableBuilders.length === 0 && podium.length > 0 && (
              <Card className="text-center text-sm text-gray-400">
                Only podium builders match this view.
              </Card>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PodiumCard({
  builder,
  place,
  featured = false,
}: {
  builder?: LeaderboardUser;
  place: 1 | 2 | 3;
  featured?: boolean;
}) {
  const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";

  if (!builder) {
    return (
      <Card className="min-h-[220px] opacity-40">
        <p className="text-sm text-gray-500">Waiting for builder #{place}</p>
      </Card>
    );
  }

  return (
    <Link href={`/passport/${builder.wallet}`} className="block">
      <Card
        className={cn(
          "group relative min-h-[250px] overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-blue-300/40",
          featured
            ? "border-yellow-300/30 bg-gradient-to-br from-yellow-300/12 via-zinc-950 to-blue-950/30 lg:min-h-[310px]"
            : "bg-gradient-to-br from-blue-400/10 via-zinc-950 to-zinc-950"
        )}
      >
        <div className="absolute right-4 top-4 text-4xl transition duration-500 group-hover:scale-110">
          {medal}
        </div>
        <div className="flex h-full flex-col justify-between gap-8">
          <ProfilePreview builder={builder} large={featured} />
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="XP" value={builder.xp} />
            <MiniMetric label="Deploy" value={builder.deployment_count} />
            <MiniMetric label="Rep" value={reputationScore(builder)} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function BuilderRow({
  builder,
  displayRank,
  metric,
}: {
  builder: LeaderboardUser;
  displayRank: number;
  metric: MetricFilter;
}) {
  return (
    <Link href={`/passport/${builder.wallet}`} className="block">
      <Card className="group transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-blue-400/5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[90px_1fr_140px_140px_140px_110px] lg:items-center">
          <div className="flex items-center gap-3">
            <span className="animate-[rankRise_420ms_ease-out] rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 font-mono text-sm font-bold text-blue-200">
              #{displayRank}
            </span>
            <span className="h-2 w-2 rounded-full bg-green-300 shadow-[0_0_18px_rgba(34,197,94,0.7)]" />
          </div>

          <ProfilePreview builder={builder} />
          <LeaderboardMetric label="XP" value={builder.xp} active={metric === "XP"} />
          <LeaderboardMetric
            label="Deployments"
            value={builder.deployment_count}
            active={metric === "Deployments"}
          />
          <LeaderboardMetric
            label="Reputation"
            value={reputationScore(builder)}
            active={metric === "Reputation"}
          />
          <div className="text-sm text-gray-400">
            <span className="font-mono text-white">{builder.streak}</span> day
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ProfilePreview({
  builder,
  large = false,
}: {
  builder: LeaderboardUser;
  large?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl border border-blue-300/30 bg-gradient-to-br from-blue-400/30 to-cyan-300/10 font-mono font-bold text-blue-100 shadow-[0_0_34px_rgba(59,130,246,0.18)]",
          large ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm"
        )}
      >
        {builder.wallet.slice(2, 4).toUpperCase()}
      </div>

      <div className="min-w-0">
        <p className={cn("truncate font-bold text-white", large ? "text-xl" : "text-base")}>
          {builder.builder_rank}
        </p>
        <p className="font-mono truncate text-sm text-gray-400">
          {shortWallet(builder.wallet)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="blue">{builder.achievements_unlocked} achievements</Badge>
          {builder.deployment_count > 0 && (
            <Badge tone="green">{builder.deployment_count} deployments</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: T[];
  active: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-label text-gray-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            onClick={() => onSelect(option)}
            variant={active === option ? "primary" : "secondary"}
            className="rounded-full px-4 py-2"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function LeaderboardMetric({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition",
        active
          ? "border-blue-300/30 bg-blue-400/10"
          : "border-zinc-800 bg-black/20"
      )}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function metricValue(builder: LeaderboardUser, metric: MetricFilter) {
  if (metric === "Deployments") return builder.deployment_count;
  if (metric === "Reputation") return reputationScore(builder);
  return builder.xp;
}

function reputationScore(builder: LeaderboardUser) {
  return (
    builder.xp +
    builder.deployment_count * 50 +
    builder.achievements_unlocked * 25 +
    builder.streak * 10
  );
}
