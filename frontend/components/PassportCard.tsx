import StatCard from "@/components/StatCard";
import { getBuilderBadge, getBuilderRank } from "@/lib/builder";
import type { Passport } from "@/lib/types";

type PassportCardProps = {
  passport: Passport;
  unlockedAchievements: number;
  totalAchievements: number;
};

export default function PassportCard({
  passport,
  unlockedAchievements,
  totalAchievements,
}: PassportCardProps) {
  const xpInLevel = passport.xp % 100;
  const xpProgress = Math.min(xpInLevel, 100);
  const builderRank = getBuilderRank(passport.xp);
  const builderBadge = getBuilderBadge(passport.xp);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Arc Passport</h2>
        <p className="text-gray-400 break-all mt-2">{passport.wallet}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-black border border-zinc-800 rounded-full px-4 py-2">
          <span className="text-xs text-blue-300">{builderBadge}</span>
          <span className="font-semibold">{builderRank}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Level {passport.level}</span>
          <span>{xpInLevel}/100 XP to next level</span>
        </div>
        <div className="h-3 bg-black rounded-full overflow-hidden border border-zinc-800">
          <div className="h-full bg-white" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Level" value={passport.level} />
        <StatCard label="XP" value={passport.xp} />
        <StatCard label="Reputation" value={passport.reputation} />
        <StatCard label="Builder Rank" value={builderRank} />
        <StatCard
          label="Achievements"
          value={`${unlockedAchievements}/${totalAchievements}`}
        />
        <StatCard label="Rank" value={`#${passport.rank}`} />
        <StatCard label="Balance" value={`${passport.balance} USDC`} />
        <StatCard label="Transactions" value={passport.tx_count} />
        <StatCard label="Contract Calls" value={passport.contract_calls} />
        <StatCard label="Token Transfers" value={passport.token_transfers} />
        <StatCard label="Tokens" value={passport.tokens_count} />
        <StatCard label="NFTs" value={passport.nft_count} />
        <StatCard label="Streak" value={`${passport.streak} day`} />
        <StatCard label="Check-in XP" value={passport.checkin_xp} />
        <StatCard label="Deployment XP" value={passport.deployment_xp} />
      </div>
    </div>
  );
}
