import StatCard from "@/components/StatCard";
import {
  getBuilderRank,
  getNextRank,
  getXpToNextRank,
} from "@/lib/builder";
import type { Passport } from "@/lib/types";

type BuilderProfileProps = {
  passport: Passport;
  contractCount: number;
  unlockedAchievements: number;
  totalAchievements: number;
};

export default function BuilderProfile({
  passport,
  contractCount,
  unlockedAchievements,
  totalAchievements,
}: BuilderProfileProps) {
  const builderRank = getBuilderRank(passport.xp);
  const nextRank = getNextRank(passport.xp);
  const xpToNextRank = getXpToNextRank(passport.xp);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Builder Profile</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Rank" value={builderRank} />
        <StatCard label="Builder Score" value={`${passport.xp} XP`} />
        <StatCard label="Contracts" value={contractCount} />
        <StatCard
          label="Achievements"
          value={`${unlockedAchievements}/${totalAchievements}`}
        />
      </div>

      <div className="bg-black border border-zinc-800 rounded-xl p-4">
        <p className="text-gray-400">Next Rank</p>
        <p className="text-xl font-bold mt-1">{nextRank}</p>
        {xpToNextRank > 0 && (
          <p className="text-gray-500 mt-1">{xpToNextRank} XP remaining</p>
        )}
      </div>
    </div>
  );
}
