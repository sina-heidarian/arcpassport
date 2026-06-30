"use client";

import { useMemo, useState } from "react";
import Achievements from "@/components/Achievements";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderPassportCard from "@/components/BuilderPassportCard";
import BuilderProfile from "@/components/BuilderProfile";
import BuilderScoreBreakdown from "@/components/BuilderScoreBreakdown";
import PassportNftOwnership from "@/components/PassportNftOwnership";
import PassportNftPreview from "@/components/PassportNftPreview";
import RecentTransactions from "@/components/RecentTransactions";
import { Badge, Button, Card, StatCard } from "@/components/ui";
import { getBuilderRank, shortWallet } from "@/lib/builder";
import { cn } from "@/lib/cn";
import type {
  Deployment,
  Passport,
  PassportNftEligibility,
  PassportNftMetadata,
  PassportNftOwnership as PassportNftOwnershipType,
  PassportNftTokenUri,
} from "@/lib/types";

type PublicPassportExperienceProps = {
  passport: Passport;
  deployments: Deployment[];
  metadata: PassportNftMetadata | null;
  tokenUri: PassportNftTokenUri | null;
  eligibility: PassportNftEligibility | null;
  ownership: PassportNftOwnershipType | null;
  unlockedAchievements: number;
  totalAchievements: number;
};

type TabId =
  | "overview"
  | "achievements"
  | "metadata"
  | "activity"
  | "nft"
  | "timeline";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "achievements", label: "Achievements" },
  { id: "metadata", label: "Metadata" },
  { id: "activity", label: "Activity" },
  { id: "nft", label: "NFT" },
  { id: "timeline", label: "Timeline" },
];

export default function PublicPassportExperience({
  passport,
  deployments,
  metadata,
  tokenUri,
  eligibility,
  ownership,
  unlockedAchievements,
  totalAchievements,
}: PublicPassportExperienceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copied, setCopied] = useState(false);
  const builderName = passport.display_name || "Arc Builder";
  const builderRank = getBuilderRank(passport.xp);
  const explorerUrl = `https://testnet.arcscan.app/address/${passport.wallet}`;
  const achievements = useMemo(
    () => passport.achievements ?? [],
    [passport.achievements]
  );

  const tabContent = useMemo(() => {
    if (activeTab === "overview") {
      return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <BuilderProfile
            passport={passport}
            contractCount={passport.deployment_count}
            unlockedAchievements={unlockedAchievements}
            totalAchievements={totalAchievements}
          />
          <BuilderScoreBreakdown breakdown={passport.xp_breakdown} />
        </div>
      );
    }

    if (activeTab === "achievements") {
      return <Achievements achievements={achievements} />;
    }

    if (activeTab === "metadata") {
      return (
        <div className="space-y-5">
          <PassportNftPreview
            metadata={metadata}
            eligibility={eligibility}
            compact
          />
          {tokenUri && (
            <Card className="border-green-900 bg-green-950/20">
              <p className="text-sm font-medium text-green-300">
                Metadata Ready
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Token URI is prepared and hidden by default for a cleaner public
                profile.
              </p>
            </Card>
          )}
        </div>
      );
    }

    if (activeTab === "activity") {
      return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BuilderContracts deployments={deployments} />
          <RecentTransactions transactions={passport.recent_transactions} />
        </div>
      );
    }

    if (activeTab === "nft") {
      return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <PassportNftOwnership
            wallet={passport.wallet}
            initialOwnership={ownership}
          />
          <PassportNftPreview
            metadata={metadata}
            eligibility={eligibility}
            compact
          />
        </div>
      );
    }

    return (
      <ActivityTimeline
        recentTransactions={passport.recent_transactions}
        deployments={deployments}
        achievements={achievements}
      />
    );
  }, [
    achievements,
    activeTab,
    deployments,
    eligibility,
    metadata,
    ownership,
    passport,
    tokenUri,
    totalAchievements,
    unlockedAchievements,
  ]);

  async function sharePassport() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${builderName} ArcPassport`,
          text: "View this ArcPassport Builder Passport.",
          url: window.location.href,
        });
        return;
      }

      await copyLink();
    } catch (error) {
      console.error("Failed to share passport:", error);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy public passport URL:", error);
    }
  }

  function downloadCard() {
    const svg = buildPassportSvg({
      builderName,
      wallet: shortWallet(passport.wallet),
      level: passport.level,
      xp: passport.xp,
      reputation: passport.reputation,
      rank: builderRank,
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `arcpassport-${passport.wallet}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-blue-300/20 bg-zinc-950 p-5 shadow-[0_34px_140px_rgba(37,99,235,0.20)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.14),transparent_34%)]" />
        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <Badge tone="blue">Public Builder Passport</Badge>
              <h1 className="text-heading max-w-3xl text-4xl font-bold tracking-[-0.02em] text-white sm:text-6xl">
                {builderName}
              </h1>
              <p className="font-mono text-sm text-gray-400">
                {shortWallet(passport.wallet)}
              </p>
              {passport.bio && (
                <p className="max-w-2xl text-base leading-7 text-gray-300">
                  {passport.bio}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Level" value={passport.level} />
              <StatCard label="XP" value={passport.xp} highlight={passport.xp > 0} />
              <StatCard label="Reputation" value={passport.reputation} />
              <StatCard label="Rank" value={`#${passport.rank}`} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={sharePassport}>Share</Button>
              <Button onClick={copyLink} variant="secondary">
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={downloadCard} variant="secondary">
                Download Card
              </Button>
              <Button
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
              >
                View on Explorer
              </Button>
            </div>
          </div>

          <BuilderPassportCard
            builderName={builderName}
            wallet={passport.wallet}
            level={passport.level}
            xp={passport.xp}
            reputation={passport.reputation}
            rank={builderRank}
          />
        </div>
      </section>

      <Card className="sticky top-24 z-20 overflow-x-auto border-blue-300/10 bg-zinc-950/80 p-2 backdrop-blur-xl">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "bg-white text-black shadow-[0_0_30px_rgba(59,130,246,0.22)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <section className="animate-[fadeIn_420ms_ease-out]">{tabContent}</section>
    </div>
  );
}

function buildPassportSvg({
  builderName,
  wallet,
  level,
  xp,
  reputation,
  rank,
}: {
  builderName: string;
  wallet: string;
  level: number;
  xp: number;
  reputation: number;
  rank: string;
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="45%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0b1120"/>
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="760" rx="52" fill="url(#bg)"/>
  <rect width="1200" height="760" rx="52" fill="url(#glow)"/>
  <rect x="36" y="36" width="1128" height="688" rx="42" fill="none" stroke="#93C5FD" stroke-opacity="0.28" stroke-width="2"/>
  <text x="80" y="110" fill="#93C5FD" font-family="Inter, Arial" font-size="28" font-weight="700" letter-spacing="5">ARCPASSPORT</text>
  <text x="80" y="210" fill="#FFFFFF" font-family="Inter, Arial" font-size="76" font-weight="800">${escapeSvg(builderName)}</text>
  <text x="82" y="272" fill="#94A3B8" font-family="monospace" font-size="30">${escapeSvg(wallet)}</text>
  <text x="80" y="398" fill="#E2E8F0" font-family="Inter, Arial" font-size="34">Soulbound Builder Passport</text>
  ${metricSvg(80, 500, "LEVEL", String(level))}
  ${metricSvg(330, 500, "XP", String(xp))}
  ${metricSvg(580, 500, "REPUTATION", String(reputation))}
  ${metricSvg(830, 500, "RANK", escapeSvg(rank))}
  <text x="80" y="670" fill="#93C5FD" font-family="Inter, Arial" font-size="26" font-weight="700">ARC • CIRCLE POWERED • SOULBOUND</text>
</svg>`;
}

function metricSvg(x: number, y: number, label: string, value: string) {
  return `<rect x="${x}" y="${y}" width="210" height="112" rx="24" fill="#020617" fill-opacity="0.58" stroke="#FFFFFF" stroke-opacity="0.12"/>
  <text x="${x + 24}" y="${y + 42}" fill="#64748B" font-family="Inter, Arial" font-size="18" font-weight="700">${label}</text>
  <text x="${x + 24}" y="${y + 86}" fill="#FFFFFF" font-family="monospace" font-size="34" font-weight="800">${value}</text>`;
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
