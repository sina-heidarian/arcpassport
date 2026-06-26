import Link from "next/link";
import { shortWallet } from "@/lib/builder";
import type { LeaderboardUser } from "@/lib/types";

type LeaderboardProps = {
  leaderboard: LeaderboardUser[];
};

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <div id="leaderboard" className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Leaderboard</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-400 text-sm">
            <tr>
              <th className="py-3">Rank</th>
              <th className="py-3">Wallet</th>
              <th className="py-3">Builder Rank</th>
              <th className="py-3">XP</th>
              <th className="py-3">Deployments</th>
              <th className="py-3">Achievements</th>
              <th className="py-3">Streak</th>
              <th className="py-3">View</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.length === 0 && (
              <tr>
                <td className="py-4 text-gray-500" colSpan={8}>
                  No leaderboard data yet.
                </td>
              </tr>
            )}

            {leaderboard.map((user) => (
              <tr key={user.wallet} className="border-t border-zinc-800 text-sm">
                <td className="py-4">#{user.rank}</td>
                <td className="py-4 text-gray-300 break-all">
                  {shortWallet(user.wallet)}
                </td>
                <td className="py-4">{user.builder_rank}</td>
                <td className="py-4">{user.xp}</td>
                <td className="py-4">{user.deployment_count}</td>
                <td className="py-4">{user.achievements_unlocked}</td>
                <td className="py-4">{user.streak} day</td>
                <td className="py-4">
                  <Link
                    href={`/passport/${user.wallet}`}
                    className="text-blue-300 hover:text-blue-200"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
