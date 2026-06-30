"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CircleContractsCard from "@/components/CircleContractsCard";
import CircleWalletsCard from "@/components/CircleWalletsCard";
import SbtContractStatus from "@/components/SbtContractStatus";
import {
  Button,
  Card,
  PageHeader,
  PageShell,
  Skeleton,
  StatCard,
} from "@/components/ui";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/cn";

const SAMPLE_WALLET = "0x4f982AbB319Afb4b5E7c164E7A97A45968a90681";

type JsonResult = Record<string, unknown> | unknown[] | string | null;
type StatusKey = "circle" | "wallets" | "paymaster";
type ActionKey = "contractDeploy" | "walletCreate" | "gasEstimate";
type HealthTone = "healthy" | "connected" | "warning" | "offline" | "loading";

const statusChecks: Array<{
  key: StatusKey;
  title: string;
  path: string;
}> = [
  {
    key: "circle",
    title: "Circle Auth",
    path: "/circle/status",
  },
  {
    key: "wallets",
    title: "Circle Wallets",
    path: "/circle/wallets/status",
  },
  {
    key: "paymaster",
    title: "Paymaster",
    path: "/circle/paymaster/status",
  },
];

export default function IntegrationsPage() {
  const { address, isConnected } = useAccount();
  const testWallet = address ?? SAMPLE_WALLET;
  const [statusResults, setStatusResults] = useState<
    Record<StatusKey, JsonResult>
  >({
    circle: null,
    wallets: null,
    paymaster: null,
  });
  const [actionResults, setActionResults] = useState<
    Record<ActionKey, JsonResult>
  >({
    contractDeploy: null,
    walletCreate: null,
    gasEstimate: null,
  });
  const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);

  useEffect(() => {
    async function loadStatuses() {
      await Promise.all(
        statusChecks.map(async (check) => {
          try {
            const data = await apiGet<Record<string, unknown>>(check.path);
            setStatusResults((current) => ({
              ...current,
              [check.key]: data,
            }));
          } catch (error) {
            console.error(`Failed to load ${check.path}:`, error);
            setStatusResults((current) => ({
              ...current,
              [check.key]: "Status check failed",
            }));
          }
        })
      );
    }

    void loadStatuses();
  }, []);

  async function runMockAction(action: ActionKey) {
    setLoadingAction(action);

    try {
      const data = await runActionRequest(action, testWallet);
      setActionResults((current) => ({
        ...current,
        [action]: data,
      }));
    } catch (error) {
      console.error("Mock integration action failed:", error);
      setActionResults((current) => ({
        ...current,
        [action]: "Mock action failed",
      }));
    } finally {
      setLoadingAction(null);
    }
  }

  const circleHealth = getCircleHealth(statusResults.circle);
  const walletsHealth = getReadyHealth(statusResults.wallets);
  const paymasterHealth = getReadyHealth(statusResults.paymaster);
  const healthyCount = [
    circleHealth,
    walletsHealth,
    paymasterHealth,
    isConnected ? "connected" : "warning",
  ].filter((status) => status === "healthy" || status === "connected").length;

  return (
    <PageShell active="integrations" width="wide">
      <section className="relative overflow-hidden rounded-[32px] border border-blue-400/20 bg-zinc-950 p-6 shadow-[0_28px_120px_rgba(37,99,235,0.16)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.12),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            eyebrow="Integrations"
            title="Integration Monitor"
            description="Professional health monitoring for ArcPassport infrastructure, Circle services, wallet state, and Arc Testnet connectivity."
          />
          <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
            <StatCard label="Systems" value="6" />
            <StatCard label="Healthy" value={healthyCount} highlight={healthyCount >= 3} />
            <StatCard label="Wallet" value={isConnected ? "On" : "Off"} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <IntegrationCard
          title="Arc"
          description="Arc Testnet builder activity and passport data layer."
          status="Connected"
          health="healthy"
          href="https://docs.arc.io"
          meta="Testnet"
        />
        <IntegrationCard
          title="Circle"
          description={circleMessage(statusResults.circle)}
          status={healthLabel(circleHealth)}
          health={circleHealth}
          href="https://developers.circle.com"
          meta="Backend API"
        />
        <IntegrationCard
          title="ArcScan"
          description="Explorer links for wallets, transactions, and imported contracts."
          status="Connected"
          health="connected"
          href="https://testnet.arcscan.app"
          meta="Explorer"
        />
        <IntegrationCard
          title="Wallet"
          description={
            isConnected
              ? `Connected wallet ${shortAddress(address)} is available for tests.`
              : "Connect wallet to test integrations with your own address."
          }
          status={isConnected ? "Connected" : "Not Connected"}
          health={isConnected ? "connected" : "warning"}
          href="/dashboard"
          meta="RainbowKit"
        />
        <IntegrationCard
          title="RPC"
          description="Read-only SBT checks and ArcPassport contract status."
          status="Healthy"
          health="healthy"
          href="/passport/mint"
          meta="Arc Testnet RPC"
        />
        <IntegrationCard
          title="Paymaster"
          description={statusMessage(statusResults.paymaster)}
          status={healthLabel(paymasterHealth)}
          health={paymasterHealth}
          href="/tools"
          meta="Blueprint"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StatusPanel
          title="Circle Wallets"
          result={statusResults.wallets}
          health={walletsHealth}
        />
        <StatusPanel
          title="Circle Auth"
          result={statusResults.circle}
          health={circleHealth}
        />
        <StatusPanel
          title="Paymaster"
          result={statusResults.paymaster}
          health={paymasterHealth}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CircleWalletsCard />
        <CircleContractsCard />
      </section>

      <SbtContractStatus />

      <section className="space-y-4">
        <div>
          <p className="text-label text-blue-300">Safe Mock Checks</p>
          <h2 className="text-heading mt-1 text-2xl font-bold">
            Blueprint Actions
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-400">
            Non-mutating preparation calls that verify backend routes are wired
            without creating wallets, contracts, or transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActionCard
            title="Contract Deploy"
            description="Prepare future Circle Contracts deployment."
            buttonLabel="Test Blueprint"
            loading={loadingAction === "contractDeploy"}
            result={actionResults.contractDeploy}
            onClick={() => runMockAction("contractDeploy")}
          />
          <ActionCard
            title="Wallet Create"
            description="Prepare future Circle Wallets creation."
            buttonLabel="Test Blueprint"
            loading={loadingAction === "walletCreate"}
            result={actionResults.walletCreate}
            onClick={() => runMockAction("walletCreate")}
          />
          <ActionCard
            title="Gas Estimate"
            description="Prepare future paymaster gas estimate."
            buttonLabel="Test Blueprint"
            loading={loadingAction === "gasEstimate"}
            result={actionResults.gasEstimate}
            onClick={() => runMockAction("gasEstimate")}
          />
        </div>
      </section>
    </PageShell>
  );
}

async function runActionRequest(action: ActionKey, wallet: string) {
  if (action === "contractDeploy") {
    return apiPost<Record<string, unknown>>("/circle/contracts/deploy", {
      wallet,
      contract_type: "counter",
      name: "Counter",
      description: "Test deploy",
    });
  }

  if (action === "walletCreate") {
    return apiPost<Record<string, unknown>>("/circle/wallets/create", {
      owner_wallet: wallet,
      wallet_type: "developer",
    });
  }

  return apiPost<Record<string, unknown>>("/circle/paymaster/estimate", {
    wallet,
    action: "deploy_contract",
  });
}

function IntegrationCard({
  title,
  description,
  status,
  health,
  href,
  meta,
}: {
  title: string;
  description: string;
  status: string;
  health: HealthTone;
  href: string;
  meta: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block"
    >
      <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-blue-400/5">
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className={cn("h-11 w-11 rounded-2xl border", healthClass(health))} />
            <HealthBadge health={health} label={status} />
          </div>

          <div>
            <p className="text-label text-gray-500">{meta}</p>
            <h3 className="text-heading mt-2 text-2xl font-bold text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </a>
  );
}

function StatusPanel({
  title,
  result,
  health,
}: {
  title: string;
  result: JsonResult;
  health: HealthTone;
}) {
  if (!result) {
    return <Skeleton className="h-40" />;
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-heading text-xl font-bold">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">{statusMessage(result)}</p>
        </div>
        <HealthBadge health={health} label={healthLabel(health)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatusMetric label="Mode" value={readString(result, "mode") ?? "real"} />
        <StatusMetric label="Status" value={healthLabel(health)} />
      </div>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  buttonLabel,
  loading,
  result,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  loading: boolean;
  result: JsonResult;
  onClick: () => void;
}) {
  const success = isSuccess(result);

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-heading text-xl font-bold">{title}</h4>
          <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
        </div>
        <HealthBadge
          health={loading ? "loading" : success ? "healthy" : result ? "warning" : "connected"}
          label={loading ? "Running" : success ? "Healthy" : result ? "Check" : "Ready"}
        />
      </div>

      <Button type="button" onClick={onClick} disabled={loading}>
        {loading ? "Testing..." : buttonLabel}
      </Button>

      <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
        <p className="text-sm font-semibold text-gray-200">
          {result ? actionMessage(result) : "Ready to run safe blueprint check."}
        </p>
      </div>
    </Card>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-100">{value}</p>
    </div>
  );
}

function HealthBadge({ health, label }: { health: HealthTone; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        health === "healthy" && "border-green-400/30 bg-green-400/10 text-green-200",
        health === "connected" && "border-blue-400/30 bg-blue-400/10 text-blue-200",
        health === "warning" && "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
        health === "offline" && "border-red-400/30 bg-red-400/10 text-red-200",
        health === "loading" && "border-zinc-600 bg-zinc-900 text-gray-300"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dotClass(health))} />
      {label}
    </span>
  );
}

function getCircleHealth(result: JsonResult): HealthTone {
  if (!result) return "loading";
  if (typeof result === "string") return "offline";
  if (Array.isArray(result)) return "warning";
  if (result.auth_ok === true) return "healthy";
  if (result.configured === true) return "warning";
  return "offline";
}

function getReadyHealth(result: JsonResult): HealthTone {
  if (!result) return "loading";
  if (typeof result === "string") return "offline";
  if (Array.isArray(result)) return "warning";
  if (result.ready === true || result.success === true) return "healthy";
  return "warning";
}

function healthLabel(health: HealthTone) {
  const labels: Record<HealthTone, string> = {
    healthy: "Healthy",
    connected: "Connected",
    warning: "Warning",
    offline: "Offline",
    loading: "Loading",
  };

  return labels[health];
}

function statusMessage(result: JsonResult) {
  if (!result) return "Checking integration status...";
  if (typeof result === "string") return result;
  if (Array.isArray(result)) return "Integration returned a list response.";
  return readString(result, "message") ?? "Integration status is available.";
}

function circleMessage(result: JsonResult) {
  if (!result) return "Checking Circle API authentication from the backend.";
  if (typeof result === "string") return result;
  if (Array.isArray(result)) return "Circle returned a list response.";
  if (result.auth_ok === true) return "Circle API authentication is healthy.";
  if (result.configured === true) return "Circle API key configured, auth needs attention.";
  return "Circle API key is not configured.";
}

function actionMessage(result: JsonResult) {
  if (typeof result === "string") return result;
  if (!result || Array.isArray(result)) return "Blueprint check completed.";
  return readString(result, "message") ?? "Blueprint check completed.";
}

function isSuccess(result: JsonResult) {
  return Boolean(
    result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      (result.success === true || result.ready === true || result.configured === true)
  );
}

function readString(result: JsonResult, key: string) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  const value = result[key];
  return typeof value === "string" ? value : null;
}

function shortAddress(address?: string) {
  if (!address) return "unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function healthClass(health: HealthTone) {
  if (health === "healthy") return "border-green-400/30 bg-green-400/10 shadow-[0_0_28px_rgba(34,197,94,0.16)]";
  if (health === "connected") return "border-blue-400/30 bg-blue-400/10 shadow-[0_0_28px_rgba(59,130,246,0.16)]";
  if (health === "warning") return "border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_28px_rgba(250,204,21,0.12)]";
  if (health === "offline") return "border-red-400/30 bg-red-400/10 shadow-[0_0_28px_rgba(239,68,68,0.12)]";
  return "border-zinc-700 bg-zinc-900";
}

function dotClass(health: HealthTone) {
  if (health === "healthy") return "bg-green-300 shadow-[0_0_14px_rgba(34,197,94,0.8)]";
  if (health === "connected") return "bg-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.8)]";
  if (health === "warning") return "bg-yellow-300 shadow-[0_0_14px_rgba(250,204,21,0.8)]";
  if (health === "offline") return "bg-red-300 shadow-[0_0_14px_rgba(239,68,68,0.8)]";
  return "bg-gray-400";
}
