import type { Achievement } from "@/lib/types";

type AchievementsProps = {
  achievements: Achievement[];
};

export default function Achievements({ achievements }: AchievementsProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Achievements</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className={`rounded-xl p-4 border ${
              achievement.unlocked
                ? "bg-black border-zinc-700"
                : "bg-zinc-950 border-zinc-900 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-300">{achievement.icon}</span>
              <div>
                <p className="font-bold">{achievement.title}</p>
                <p className="text-sm text-gray-400">{achievement.description}</p>
              </div>
            </div>

            <p className="text-sm mt-3">
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
