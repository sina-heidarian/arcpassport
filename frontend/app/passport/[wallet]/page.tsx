import PublicPassportExperience from "@/components/PublicPassportExperience";
import { Card, PageShell } from "@/components/ui";
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
      <PageShell active="home" width="wide">
          <Card className="space-y-3">
            <h2 className="text-2xl font-bold">Passport unavailable</h2>
            <p className="text-gray-400 break-all">
              Could not load a public passport for {wallet}.
            </p>
          </Card>
      </PageShell>
    );
  }

  const { passport, deployments, metadata, tokenUri, eligibility, ownership } = publicPassport;
  const achievements = passport.achievements ?? [];
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <PageShell active="home" width="wide">
        <PublicPassportExperience
          passport={passport}
          deployments={deployments}
          metadata={metadata}
          tokenUri={tokenUri}
          eligibility={eligibility}
          ownership={ownership}
          unlockedAchievements={unlockedAchievements}
          totalAchievements={achievements.length}
        />
    </PageShell>
  );
}
