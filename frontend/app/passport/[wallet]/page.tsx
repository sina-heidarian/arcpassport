import Achievements from "@/components/Achievements";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderProfile from "@/components/BuilderProfile";
import BuilderScoreBreakdown from "@/components/BuilderScoreBreakdown";
import Navbar from "@/components/Navbar";
import PassportCard from "@/components/PassportCard";
import PublicPassportHero from "@/components/PublicPassportHero";
import RecentTransactions from "@/components/RecentTransactions";
import { serverApiUrl } from "@/lib/api";
import type { Deployment, Passport } from "@/lib/types";

type PublicPassportPageProps = {
  params: Promise<{
    wallet: string;
  }>;
};

type DeploymentsResponse = {
  deployments: Deployment[];
};

async function getPublicPassport(wallet: string) {
  try {
    const passportResponse = await fetch(
      serverApiUrl(`/passport/${encodeURIComponent(wallet)}`),
      { cache: "no-store" }
    );

    if (!passportResponse.ok) {
      throw new Error(`Passport request failed: ${passportResponse.status}`);
    }

    const passport = (await passportResponse.json()) as Passport;

    const deploymentsResponse = await fetch(
      serverApiUrl(`/deployments/${encodeURIComponent(wallet)}`),
      { cache: "no-store" }
    );

    if (!deploymentsResponse.ok) {
      throw new Error(
        `Deployments request failed: ${deploymentsResponse.status}`
      );
    }

    const deploymentsData =
      (await deploymentsResponse.json()) as DeploymentsResponse;

    return {
      passport,
      deployments: deploymentsData.deployments || [],
    };
  } catch (error) {
    console.error("Failed to load public passport:", error);
    return null;
  }
}

export default async function PublicPassportPage({
  params,
}: PublicPassportPageProps) {
  const { wallet } = await params;
  const publicPassport = await getPublicPassport(wallet);

  if (!publicPassport) {
    return (
      <main className="min-h-screen bg-black text-white p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <Navbar active="home" />

          <div className="bg-zinc-900 rounded-2xl p-6 space-y-3">
            <h2 className="text-2xl font-bold">Passport unavailable</h2>
            <p className="text-gray-400 break-all">
              Could not load a public passport for {wallet}.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { passport, deployments } = publicPassport;
  const achievements = passport.achievements ?? [];
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="home" />

        <PublicPassportHero passport={passport} />

        <PassportCard
          passport={passport}
          unlockedAchievements={unlockedAchievements}
          totalAchievements={achievements.length}
        />

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Builder Profile</h3>
          <BuilderProfile
            passport={passport}
            contractCount={passport.deployment_count}
            unlockedAchievements={unlockedAchievements}
            totalAchievements={achievements.length}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Score Breakdown</h3>
          <BuilderScoreBreakdown breakdown={passport.xp_breakdown} />
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Achievements</h3>
          <Achievements achievements={achievements} />
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Activity Timeline</h3>
          <ActivityTimeline
            recentTransactions={passport.recent_transactions}
            deployments={deployments}
            achievements={achievements}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Builder Contracts</h3>
          <BuilderContracts deployments={deployments} />
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Recent Transactions</h3>
          <RecentTransactions transactions={passport.recent_transactions} />
        </section>
      </div>
    </main>
  );
}
