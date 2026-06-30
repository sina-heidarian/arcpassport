"use client";

import type { ReactNode } from "react";
import Achievements from "@/components/Achievements";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import BuilderPassportCard from "@/components/BuilderPassportCard";
import CircleContractsCard from "@/components/CircleContractsCard";
import CircleWalletsCard from "@/components/CircleWalletsCard";
import PassportNftOwnership from "@/components/PassportNftOwnership";
import { usePassportContext } from "@/components/PassportProvider";
import QuestProgress from "@/components/QuestProgress";
import PublicPassportShare from "@/components/PublicPassportShare";
import RecentTransactions from "@/components/RecentTransactions";
import SyncStatusIndicator from "@/components/SyncStatusIndicator";
import {
  Button,
  Card,
  EmptyState,
  PageHeader,
  PageShell,
  Skeleton,
  StatCard,
} from "@/components/ui";
import { getBuilderRank } from "@/lib/builder";

export default function DashboardPage() {
  const {
    isConnected,
    passport,
    deployments,
    loading,
    refreshing,
    error,
    refreshPassport,
  } = usePassportContext();

  const achievements = passport?.achievements ?? [];
  const builderName = passport?.display_name || "Arc Builder";
  const builderRank = passport ? getBuilderRank(passport.xp) : "-";
  const latestDeployments = deployments.slice(0, 4);
  const latestTransactions = passport?.recent_transactions.slice(0, 6) ?? [];

  return (
    <PageShell active="dashboard">
        {!isConnected && (
          <EmptyState
            title="Connect your wallet"
            description="Connect your wallet to view your ArcPassport dashboard."
          />
        )}

        {isConnected && loading && (
          <DashboardSkeleton />
        )}

        {isConnected && !loading && error && (
          <Card className="text-red-300">
            {error}
          </Card>
        )}

        {passport && refreshing && (
          <p className="text-sm text-gray-500">Refreshing dashboard...</p>
        )}

        {passport && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
              <Card className="relative overflow-hidden p-8" variant="elevated">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(59,130,246,0.22),transparent_30%)]" />
                <div className="relative space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <PageHeader
                      eyebrow="Dashboard"
                      title="Welcome back."
                      description="Your builder identity, progress, quests, deployments, and Circle infrastructure in one focused workspace."
                    />
                    <SyncStatusIndicator
                      wallet={passport.wallet}
                      onSynced={() => refreshPassport(true)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard label="XP" value={passport.xp} highlight={passport.xp > 0} />
                    <StatCard label="Reputation" value={passport.reputation} />
                    <StatCard label="Deployments" value={passport.deployment_count} />
                    <StatCard label="Transactions" value={passport.tx_count} />
                  </div>
                </div>
              </Card>

              <BuilderPassportCard
                builderName={builderName}
                wallet={passport.wallet}
                level={passport.level}
                xp={passport.xp}
                reputation={passport.reputation}
                rank={builderRank}
              />
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="XP" value={passport.xp} highlight={passport.xp > 0} />
              <StatCard label="Reputation" value={passport.reputation} />
              <StatCard label="Deployments" value={passport.deployment_count} />
              <StatCard label="Contracts" value={passport.contract_calls} />
              <StatCard label="Transactions" value={passport.tx_count} />
              <StatCard label="Quest XP" value={passport.quest_xp ?? 0} />
              <StatCard label="Streak" value={`${passport.streak} day`} />
              <StatCard label="Rank" value={`#${passport.rank}`} />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              <DashboardPanel title="Today's Quest" actionHref="/quests" actionLabel="All quests">
                <QuestProgress wallet={passport.wallet} />
              </DashboardPanel>

              <DashboardPanel title="Recent Activity">
                <ActivityTimeline
                  recentTransactions={passport.recent_transactions.slice(0, 3)}
                  deployments={deployments.slice(0, 2)}
                  achievements={achievements}
                />
              </DashboardPanel>

              <DashboardPanel title="Achievements" actionHref="/quests" actionLabel="View quests">
                <Achievements achievements={achievements.slice(0, 4)} />
              </DashboardPanel>

              <DashboardPanel title="Quick Actions">
                <QuickActions wallet={passport.wallet} />
              </DashboardPanel>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <DashboardPanel title="Latest Deployments" actionHref="/tools" actionLabel="Deploy">
                <BuilderContracts deployments={latestDeployments} />
              </DashboardPanel>

              <DashboardPanel title="Recent Transactions">
                <RecentTransactions transactions={latestTransactions} />
              </DashboardPanel>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <PassportNftOwnership wallet={passport.wallet} compact />
              <CircleWalletsCard compact />
              <CircleContractsCard compact />
            </section>

            <PublicPassportShare wallet={passport.wallet} />
          </div>
        )}
    </PageShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading text-xl font-bold">{title}</h2>
        {actionHref && actionLabel && (
          <Button href={actionHref} variant="ghost" className="shrink-0 px-0 py-0 text-xs">
            {actionLabel}
          </Button>
        )}
      </div>
      <div className="[&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0">
        {children}
      </div>
    </Card>
  );
}

function QuickActions({ wallet }: { wallet: string }) {
  return (
    <div className="grid gap-3">
      <Button href="/tools" className="w-full">
        Open Workspace
      </Button>
      <Button href="/quests" className="w-full" variant="secondary">
        Explore Quests
      </Button>
      <Button href={`/passport/${wallet}`} className="w-full" variant="secondary">
        Public Passport
      </Button>
      <Button href="/profile" className="w-full" variant="ghost">
        Profile Settings
      </Button>
    </div>
  );
}
