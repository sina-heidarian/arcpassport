"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { apiGet } from "@/lib/api";
import type {
  PassportNftContractInfo,
  PassportNftStatus,
} from "@/lib/types";

type SbtContractStatusProps = {
  compact?: boolean;
};

export default function SbtContractStatus({
  compact,
}: SbtContractStatusProps) {
  const [status, setStatus] = useState<PassportNftStatus | null>(null);
  const [contractInfo, setContractInfo] =
    useState<PassportNftContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoLoading, setInfoLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadContractStatus() {
      try {
        const [statusData, contractInfoData] = await Promise.all([
          apiGet<PassportNftStatus>("/api/v1/passport-nft/status"),
          apiGet<PassportNftContractInfo>(
            "/api/v1/passport-nft/contract-info"
          ),
        ]);

        if (active) {
          setStatus(statusData);
          setContractInfo(contractInfoData);
          setError(null);
          setInfoError(null);
        }
      } catch (loadError) {
        console.error("Failed to load SBT contract status:", loadError);
        if (active) {
          try {
            const statusData = await apiGet<PassportNftStatus>(
              "/api/v1/passport-nft/status"
            );
            setStatus(statusData);
            setError(null);
            setInfoError("Contract read is unavailable.");
          } catch (statusError) {
            console.error("Failed to load SBT status fallback:", statusError);
            setError("Builder Passport contract status is unavailable.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
          setInfoLoading(false);
        }
      }
    }

    void loadContractStatus();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
            Passport NFT
          </p>
          <h2 className={compact ? "text-xl font-bold" : "text-2xl font-bold"}>
            ArcPassportSBT Contract
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Status:{" "}
            <span className="text-green-300">
              {status?.configured
                ? "Deployed on Arc Testnet"
                : "Not configured"}
            </span>
          </p>
        </div>

        {status?.explorer_url && (
          <Button
            href={status.explorer_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0"
          >
            View on ArcScan
          </Button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading status...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {infoLoading && !loading && (
        <p className="text-sm text-gray-500">Reading contract...</p>
      )}
      {infoError && <p className="text-sm text-yellow-300">{infoError}</p>}

      {status && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatusItem
            label="Contract Address"
            value={status.contract_address ?? "Not configured"}
          />
          <StatusItem label="Network" value={status.network} />
        </div>
      )}

      {contractInfo && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatusItem label="Name" value={contractInfo.name ?? "-"} />
          <StatusItem label="Symbol" value={contractInfo.symbol ?? "-"} />
          <StatusItem label="Owner" value={contractInfo.owner ?? "-"} />
          <StatusItem
            label="Total Supply"
            value={
              contractInfo.totalSupply === null
                ? "Unavailable"
                : contractInfo.totalSupply.toString()
            }
          />
        </div>
      )}
    </Card>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="muted">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-all font-semibold text-gray-100">{value}</p>
    </Card>
  );
}
