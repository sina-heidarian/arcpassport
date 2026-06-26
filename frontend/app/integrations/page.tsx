"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Navbar from "@/components/Navbar";
import { apiGet, apiPost } from "@/lib/api";

const SAMPLE_WALLET = "0x4f982AbB319Afb4b5E7c164E7A97A45968a90681";

type JsonResult = Record<string, unknown> | unknown[] | string | null;

type StatusKey = "circle" | "wallets" | "paymaster";
type ActionKey = "contractDeploy" | "walletCreate" | "gasEstimate";

const statusChecks: Array<{
  key: StatusKey;
  title: string;
  path: string;
}> = [
  {
    key: "circle",
    title: "Circle API Config",
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

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="integrations" />

        <section className="space-y-3">
          <h2 className="text-3xl font-bold">Circle Integration Status</h2>
          <p className="max-w-2xl text-gray-400">
            Internal checks for ArcPassport Circle integration blueprints. These
            calls use mock endpoints only.
          </p>
          {!isConnected && (
            <p className="text-sm text-yellow-300">
              Connect wallet to test with your own address.
            </p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {statusChecks.map((check) => (
            <JsonCard
              key={check.key}
              title={check.title}
              result={statusResults[check.key] ?? "Loading..."}
            />
          ))}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">Mock Action Tests</h3>
            <p className="text-sm text-gray-400 mt-1 break-all">
              Test wallet: {testWallet}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ActionCard
              title="Test Mock Contract Deploy"
              description="Calls the mock Circle Contracts deploy blueprint."
              buttonLabel="Test Mock Contract Deploy"
              loading={loadingAction === "contractDeploy"}
              result={actionResults.contractDeploy}
              onClick={() => runMockAction("contractDeploy")}
            />
            <ActionCard
              title="Test Mock Wallet Create"
              description="Calls the mock Circle Wallets create blueprint."
              buttonLabel="Test Mock Wallet Create"
              loading={loadingAction === "walletCreate"}
              result={actionResults.walletCreate}
              onClick={() => runMockAction("walletCreate")}
            />
            <ActionCard
              title="Test Mock Gas Estimate"
              description="Calls the mock Paymaster gas estimate blueprint."
              buttonLabel="Test Mock Gas Estimate"
              loading={loadingAction === "gasEstimate"}
              result={actionResults.gasEstimate}
              onClick={() => runMockAction("gasEstimate")}
            />
          </div>
        </section>
      </div>
    </main>
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
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <div>
        <h4 className="text-xl font-bold">{title}</h4>
        <p className="text-sm text-gray-400 mt-2">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bg-white text-black rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Testing..." : buttonLabel}
      </button>

      <JsonBlock result={result ?? "No result yet"} />
    </div>
  );
}

function JsonCard({ title, result }: { title: string; result: JsonResult }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <h3 className="text-xl font-bold">{title}</h3>
      <JsonBlock result={result} />
    </div>
  );
}

function JsonBlock({ result }: { result: JsonResult }) {
  return (
    <pre className="max-h-64 overflow-auto rounded-xl border border-zinc-800 bg-black p-3 text-xs text-gray-300 whitespace-pre-wrap">
      {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
    </pre>
  );
}
