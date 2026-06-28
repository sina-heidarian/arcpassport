import Achievements from "@/components/Achievements";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderProfile from "@/components/BuilderProfile";
import BuilderScoreBreakdown from "@/components/BuilderScoreBreakdown";
import Navbar from "@/components/Navbar";
import PassportCard from "@/components/PassportCard";
import PassportNftOwnership from "@/components/PassportNftOwnership";
import PassportNftPreview from "@/components/PassportNftPreview";
import PublicPassportHero from "@/components/PublicPassportHero";
import RecentTransactions from "@/components/RecentTransactions";
import { serverApiUrl } from "@/lib/api";
import type {
  Deployment,
  Passport,
  PassportNftEligibility,
  PassportNftMetadata,
  PassportNftOwnership as PassportNftOwnershipType,
  PassportNftTokenUri,
} from "@/lib/types";

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

    const [metadataResponse, tokenUriResponse, eligibilityResponse] = await Promise.all([
      fetch(serverApiUrl(`/api/v1/passport/${encodeURIComponent(wallet)}/metadata`), {
        cache: "no-store",
      }),
      fetch(
        serverApiUrl(`/api/v1/passport/${encodeURIComponent(wallet)}/token-uri`),
        { cache: "no-store" }
      ),
      fetch(
        serverApiUrl(`/api/v1/passport/${encodeURIComponent(wallet)}/eligibility`),
        { cache: "no-store" }
      ),
    ]);

    const ownershipResponse = await fetch(
      serverApiUrl(
        `/api/v1/passport-nft/${encodeURIComponent(wallet)}/ownership`
      ),
      { cache: "no-store" }
    );

    const metadata = metadataResponse.ok
      ? ((await metadataResponse.json()) as PassportNftMetadata)
      : null;
    const tokenUri = tokenUriResponse.ok
      ? ((await tokenUriResponse.json()) as PassportNftTokenUri)
      : null;
    const eligibility = eligibilityResponse.ok
      ? ((await eligibilityResponse.json()) as PassportNftEligibility)
      : null;
    const ownership = ownershipResponse.ok
      ? ((await ownershipResponse.json()) as PassportNftOwnershipType)
      : null;

    return {
      passport,
      deployments: deploymentsData.deployments || [],
      metadata,
      tokenUri,
      eligibility,
      ownership,
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

  const { passport, deployments, metadata, tokenUri, eligibility, ownership } = publicPassport;
  const achievements = passport.achievements ?? [];
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="home" />

        <PublicPassportHero passport={passport} />

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Future Builder Passport</h3>
          <PassportNftPreview
            metadata={metadata}
            eligibility={eligibility}
            compact
          />
          {tokenUri && (
            <div className="rounded-2xl border border-green-900 bg-green-950/20 p-5">
              <p className="text-sm font-medium text-green-300">
                Metadata Ready
              </p>
              <p className="mt-2 break-all text-xs text-gray-400">
                Token URI prepared for future minting.
              </p>
            </div>
          )}
          <PassportNftOwnership
            wallet={passport.wallet}
            initialOwnership={ownership}
            compact
          />
        </section>

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
