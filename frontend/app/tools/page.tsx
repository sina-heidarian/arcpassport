"use client";

import { useEffect, useRef, useState } from "react";
import { useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import DailyCheckin from "@/components/DailyCheckin";
import DeployCard from "@/components/DeployCard";
import MintPassport from "@/components/MintPassport";
import Navbar from "@/components/Navbar";
import { usePassportContext } from "@/components/PassportProvider";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { apiPost } from "@/lib/api";
import { counterAbi, counterBytecode } from "@/lib/counterContract";

type Tool = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  disabled?: boolean;
};

type ToolSection = {
  title: string;
  description: string;
  tools: Tool[];
};

const toolSections: ToolSection[] = [
  {
    title: "Build",
    description: "Prepare contract deployment flows.",
    tools: [
      {
        title: "Circle Contract Deploy",
        description: "Prepare future Circle-powered contract deployment.",
        cta: "Prepare Deploy",
        disabled: true,
      },
    ],
  },
  {
    title: "Fund",
    description: "Get assets and prepare your wallet.",
    tools: [
      {
        title: "Builder Wallet",
        description:
          "Prepare a Circle-powered Arc builder wallet for future deployments and rewards.",
        cta: "Coming Soon",
        disabled: true,
      },
      {
        title: "Gas Sponsorship",
        description:
          "Prepare future gasless or sponsored builder actions on Arc.",
        cta: "Coming Soon",
        disabled: true,
      },
      {
        title: "Circle Faucet",
        description: "Claim Arc testnet USDC, EURC, and cirBTC.",
        href: "/faucet",
        cta: "Open Faucet",
      },
      {
        title: "Gateway / Unified Balance",
        description: "View and use unified USDC balances across supported chains.",
        cta: "Coming Soon",
        disabled: true,
      },
      {
        title: "CCTP Bridge",
        description: "Move native USDC across chains using Circle CCTP.",
        cta: "Coming Soon",
        disabled: true,
      },
    ],
  },
  {
    title: "Explore",
    description: "Inspect activity and learn from official resources.",
    tools: [
      {
        title: "ArcScan",
        description: "Explore Arc Testnet transactions, contracts, and wallets.",
        href: "https://testnet.arcscan.app",
        cta: "Open ArcScan",
      },
      {
        title: "Infinity Name",
        description: "Register or manage your Arc identity.",
        href: "https://app.infinityname.com",
        cta: "Open Infinity Name",
      },
      {
        title: "Arc Docs",
        description: "Read official Arc documentation and builder guides.",
        href: "https://docs.arc.io",
        cta: "Open Docs",
      },
      {
        title: "Circle Docs",
        description: "Explore Circle Wallets, Contracts, Gateway, CCTP, and App Kit.",
        href: "https://developers.circle.com",
        cta: "Open Circle Docs",
      },
      {
        title: "AI Builder",
        description: "Generate, understand, and deploy smart contracts with AI.",
        cta: "Coming Soon",
        disabled: true,
      },
    ],
  },
];

export default function ToolsPage() {
  const { wallet, isConnected, passport, refreshing, refreshPassport } =
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
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="workspace" />

        <section className="space-y-3">
          <h2 className="text-3xl font-bold">Builder Workspace</h2>
          <p className="max-w-2xl text-gray-400">
            A focused launchpad for Arc builders: build, fund, explore, and
            prepare your persistent builder identity.
          </p>
        </section>

        <ActionLinkCard
          title="Quest Progress"
          description="Track builder goals and XP rewards from one focused page."
          href="/quests"
          cta="Open Quests"
        />

        {!isConnected && (
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold">Connect your wallet</h2>
            <p className="text-gray-400 mt-2">
              Connect your wallet to deploy, check in, and prepare your Builder
              Passport.
            </p>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-2xl font-bold">Actions</h3>
            {passport && refreshing && (
              <p className="text-sm text-gray-500">Refreshing workspace...</p>
            )}
          </div>

          <DeployCard
            isConnected={isConnected}
            deployPending={deployPending}
            deployHash={deployHash}
            contractAddress={receipt?.contractAddress ?? undefined}
            deployError={deployError}
            onDeploy={deployCounterContract}
          />

          {passport ? (
            <DailyCheckin
              passport={passport}
              checkinLoading={checkinLoading}
              onCheckin={dailyCheckin}
            />
          ) : (
            <LockedActionCard
              title="Daily Check-in"
              description="Claim daily XP and build your streak."
            />
          )}

          {passport ? (
            <MintPassport wallet={passport.wallet} />
          ) : (
            <LockedActionCard
              title="Builder Passport NFT"
              description="Mint your onchain builder identity for Arc."
            />
          )}

          {passport ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ActionLinkCard
                title="Public Passport"
                description="Open your shareable Arc builder profile."
                href={`/passport/${passport.wallet}`}
                cta="View Passport"
              />
              <ActionLinkCard
                title="Profile Settings"
                description="Update your public builder profile details."
                href="/profile"
                cta="Edit Profile"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LockedActionCard
                title="Public Passport"
                description="Connect wallet to use this tool."
              />
              <LockedActionCard
                title="Profile Settings"
                description="Connect wallet to use this tool."
              />
            </div>
          )}
        </section>

        <div className="space-y-8">
          {toolSections.map((section) => (
            <section key={section.title} className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{section.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {section.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.tools.map((tool) => (
                  <ToolCard key={tool.title} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
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
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4 opacity-60">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>

      <button
        type="button"
        disabled
        className="bg-white text-black rounded-xl px-5 py-3 font-medium opacity-50"
      >
        Connect Wallet
      </button>

      <p className="text-sm text-gray-500">Connect wallet to use this tool.</p>
    </div>
  );
}

function ActionLinkCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-600"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-400 mt-1">{description}</p>
      <span className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 font-medium text-black">
        {cta}
      </span>
    </a>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const className = `rounded-2xl border p-5 transition ${
    tool.disabled
      ? "pointer-events-none border-zinc-900 bg-zinc-950 opacity-50"
      : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
  }`;

  const content = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h4 className="text-xl font-bold">{tool.title}</h4>
        <p className="text-sm text-gray-400 mt-2">{tool.description}</p>
      </div>
      <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-gray-300">
        {tool.cta ?? (tool.disabled ? "Coming Soon" : "Open")}
      </span>
    </div>
  );

  if (tool.disabled || !tool.href) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={tool.href}
      target={tool.href.startsWith("http") ? "_blank" : undefined}
      rel={tool.href.startsWith("http") ? "noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}
