"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import ActivityTimeline from "@/components/ActivityTimeline";
import BuilderContracts from "@/components/BuilderContracts";
import CircleContractsCard from "@/components/CircleContractsCard";
import CircleWalletsCard from "@/components/CircleWalletsCard";
import DailyCheckin from "@/components/DailyCheckin";
import DeployCard from "@/components/DeployCard";
import MintPassport from "@/components/MintPassport";
import { usePassportContext } from "@/components/PassportProvider";
import PassportReadinessCard from "@/components/PassportReadinessCard";
import SbtContractStatus from "@/components/SbtContractStatus";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  PageShell,
  StatCard,
} from "@/components/ui";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { apiPost } from "@/lib/api";
import { counterAbi, counterBytecode } from "@/lib/counterContract";

export default function ToolsPage() {
  const { wallet, isConnected, passport, deployments, refreshing, refreshPassport } =
    usePassportContext();
  const {
    deployContract,
    data: deployHash,
    isPending: deployPending,
    error: deployError,
  } = useDeployContract();
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: deployHash,
  });
  const { loadLeaderboard } = useLeaderboard();
  const [checkinLoading, setCheckinLoading] = useState(false);
  const savedDeploymentHash = useRef<string | null>(null);

  function deployCounterContract() {
    deployContract({
      abi: counterAbi,
      bytecode: counterBytecode,
    });
  }

  async function dailyCheckin() {
    if (!passport) {
      return;
    }

    setCheckinLoading(true);

    try {
      const data = await apiPost<{ message: string }>(
        `/checkin/${passport.wallet}`
      );
      alert(data.message);
      await refreshPassport(true);
      await loadLeaderboard(true);
    } catch (error) {
      console.error("Daily check-in failed:", error);
    } finally {
      setCheckinLoading(false);
    }
  }

  useEffect(() => {
    async function saveDeploymentReceipt() {
      if (!receipt?.contractAddress || !deployHash || !wallet) {
        return;
      }

      if (savedDeploymentHash.current === deployHash) {
        return;
      }

      savedDeploymentHash.current = deployHash;

      try {
        await apiPost("/deployment", {
          wallet,
          contract_address: receipt.contractAddress,
          tx_hash: deployHash,
        });

        alert("Builder XP +100 awarded!");
        await refreshPassport(true);
        await loadLeaderboard(true);
      } catch (error) {
        savedDeploymentHash.current = null;
        console.error("Failed to save deployment:", error);
      }
    }

    saveDeploymentReceipt();
  }, [receipt, deployHash, wallet, refreshPassport, loadLeaderboard]);

  return (
    <PageShell active="workspace" width="wide">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(59,130,246,0.22),transparent_34%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            eyebrow="Builder Console"
            title="Builder Console"
            description="A focused operating system for Arc builders: infrastructure, deployments, status, activity, and developer actions."
          />
          <div className="flex flex-wrap gap-2">
            <Badge tone={isConnected ? "green" : "yellow"}>
              {isConnected ? "Wallet connected" : "Wallet required"}
            </Badge>
            {passport && refreshing && <Badge tone="blue">Refreshing</Badge>}
          </div>
        </div>
      </section>

      {!isConnected && (
        <EmptyState
          title="Connect your wallet"
          description="Connect your wallet to activate deploy, check-in, mint, profile, and passport actions."
        />
      )}

      <ConsoleSection
        title="Circle Wallet"
        description="Developer-controlled Circle wallet infrastructure presented as builder-ready resources."
      >
        <CircleWalletsCard />
      </ConsoleSection>

      <ConsoleSection
        title="Circle Contracts"
        description="Read-only Circle contracts that can be imported into ArcPassport deployment tracking."
      >
        <CircleContractsCard />
      </ConsoleSection>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <ConsoleSection
          title="Builder Status"
          description="Passport readiness, SBT status, and core builder signals."
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="XP" value={passport?.xp ?? 0} highlight={Boolean(passport?.xp)} />
            <StatCard label="Reputation" value={passport?.reputation ?? 0} />
            <StatCard label="Deployments" value={passport?.deployment_count ?? 0} />
            <StatCard label="Streak" value={passport ? `${passport.streak} day` : "-"} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PassportReadinessCard wallet={passport?.wallet ?? wallet} />
            <SbtContractStatus compact />
          </div>
        </ConsoleSection>

        <ConsoleSection
          title="Recent Activity"
          description="Latest deployments, transactions, and unlocked builder milestones."
        >
          {passport ? (
            <ActivityTimeline
              recentTransactions={passport.recent_transactions.slice(0, 4)}
              deployments={deployments.slice(0, 3)}
              achievements={passport.achievements ?? []}
            />
          ) : (
            <LockedActionCard
              title="Activity unavailable"
              description="Connect wallet to load recent builder activity."
            />
          )}
        </ConsoleSection>
      </section>

      <ConsoleSection
        title="Deployments"
        description="Deploy contracts and review your latest tracked builder contracts."
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <DeployCard
            isConnected={isConnected}
            deployPending={deployPending}
            deployHash={deployHash}
            contractAddress={receipt?.contractAddress ?? undefined}
            deployError={deployError}
            onDeploy={deployCounterContract}
          />
          <BuilderContracts deployments={deployments.slice(0, 4)} />
        </div>
      </ConsoleSection>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ConsoleSection
          title="Developer Tools"
          description="External developer resources and future ArcPassport infrastructure modules."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DeveloperToolCard
              title="ArcScan"
              description="Inspect Arc Testnet wallets, contracts, and transactions."
              href="https://testnet.arcscan.app"
              cta="Open"
            />
            <DeveloperToolCard
              title="Arc Docs"
              description="Read official Arc documentation and builder guides."
              href="https://docs.arc.io"
              cta="Docs"
            />
            <DeveloperToolCard
              title="Circle Docs"
              description="Explore Circle Wallets, Contracts, Gateway, CCTP, and App Kit."
              href="https://developers.circle.com"
              cta="Docs"
            />
            <DeveloperToolCard
              title="Infinity Name"
              description="Register or manage your Arc identity."
              href="https://app.infinityname.com"
              cta="Open"
            />
            <DeveloperToolCard
              title="AI Builder"
              description="Generate and understand smart contracts with AI."
              cta="Coming Soon"
              disabled
            />
            <DeveloperToolCard
              title="Gateway / CCTP"
              description="Future unified balance and USDC bridge tooling."
              cta="Coming Soon"
              disabled
            />
          </div>
        </ConsoleSection>

        <ConsoleSection
          title="Quick Actions"
          description="Frequent builder actions without leaving the console."
        >
          <div className="grid gap-4">
            {passport ? (
              <DailyCheckin
                passport={passport}
                checkinLoading={checkinLoading}
                onCheckin={dailyCheckin}
              />
            ) : (
              <LockedActionCard
                title="Daily Check-in"
                description="Connect wallet to claim daily XP and build your streak."
              />
            )}

            {passport ? (
              <MintPassport wallet={passport.wallet} />
            ) : (
              <LockedActionCard
                title="Builder Passport NFT"
                description="Connect wallet to prepare your onchain builder identity."
              />
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ActionButton href="/faucet" label="Open Faucet" />
              <ActionButton href="/quests" label="Quest Progress" />
              <ActionButton
                href={passport ? `/passport/${passport.wallet}` : "/dashboard"}
                label="Public Passport"
                disabled={!passport}
              />
              <ActionButton href="/profile" label="Profile Settings" disabled={!passport} />
            </div>
          </div>
        </ConsoleSection>
      </section>
    </PageShell>
  );
}

function LockedActionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="space-y-4 opacity-60" variant="muted">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>

      <Button disabled>
        Connect Wallet
      </Button>

      <p className="text-sm text-gray-500">Connect wallet to use this tool.</p>
    </Card>
  );
}

function ConsoleSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-label text-blue-300">Console Section</p>
        <h2 className="text-heading mt-1 text-2xl font-bold">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-gray-400">{description}</p>
      </div>
      <div className="[&>div]:min-w-0 [&>section]:min-w-0">{children}</div>
    </section>
  );
}

function DeveloperToolCard({
  title,
  description,
  href,
  cta,
  disabled = false,
}: {
  title: string;
  description: string;
  href?: string;
  cta: string;
  disabled?: boolean;
}) {
  const card = (
    <Card
      className={`h-full transition ${
        disabled ? "opacity-50" : "hover:-translate-y-0.5 hover:border-blue-300/30"
      }`}
      variant={disabled ? "muted" : "default"}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <div className="mb-4 h-8 w-8 rounded-xl border border-blue-400/20 bg-blue-400/10" />
          <h3 className="text-heading text-lg font-bold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-gray-300">
          {cta}
        </span>
      </div>
    </Card>
  );

  if (disabled || !href) {
    return card;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block"
    >
      {card}
    </a>
  );
}

function ActionButton({
  href,
  label,
  disabled = false,
}: {
  href: string;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <Button disabled variant="secondary" className="w-full">
        {label}
      </Button>
    );
  }

  return (
    <Button href={href} variant="secondary" className="w-full">
      {label}
    </Button>
  );
}
