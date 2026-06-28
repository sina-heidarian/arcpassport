"use client";

import { useEffect, useState } from "react";
import { usePassportContext } from "@/components/PassportProvider";
import { apiGet, apiPost } from "@/lib/api";

type CircleContract = {
  id?: string;
  name?: string;
  description?: string;
  contractAddress?: string;
  blockchain?: string;
  deployerAddress?: string;
  status?: string;
  updateDate?: string;
  createDate?: string;
};

type CircleContractsResponse = {
  success: boolean;
  mode: "real";
  contracts: CircleContract[];
};

type CircleContractImportResponse = {
  success: boolean;
  imported: boolean;
  message: string;
  deployment: {
    contract_address: string;
    tx_hash: string;
    created_at: string;
  };
};

export default function CircleContractsCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { passport, deployments, refreshPassport } = usePassportContext();
  const [contracts, setContracts] = useState<CircleContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  async function loadContracts() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiGet<CircleContractsResponse>("/circle/contracts");
      setContracts(data.contracts);
    } catch (loadError) {
      console.error("Failed to load Circle contracts:", loadError);
      setContracts([]);
      setError("Unable to load Circle contracts safely.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialContracts() {
      try {
        const data = await apiGet<CircleContractsResponse>("/circle/contracts");

        if (!isMounted) {
          return;
        }

        setContracts(data.contracts);
      } catch (loadError) {
        console.error("Failed to load Circle contracts:", loadError);

        if (!isMounted) {
          return;
        }

        setContracts([]);
        setError("Unable to load Circle contracts safely.");
      }
    }

    void loadInitialContracts();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleContracts = compact ? contracts.slice(0, 1) : contracts;

  async function importContract(contract: CircleContract) {
    if (!passport?.wallet || !contract.id) {
      return;
    }

    setImportingId(contract.id);
    setError(null);

    try {
      await apiPost<CircleContractImportResponse>("/circle/contracts/import", {
        wallet: passport.wallet,
        contract_id: contract.id,
      });
      setImportedIds((current) => new Set(current).add(contract.id as string));
      await refreshPassport(true);
      window.dispatchEvent(new Event("arcpassport:quests-refresh"));
    } catch (importError) {
      console.error("Failed to import Circle contract:", importError);
      setError("Unable to import Circle contract.");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Circle Contracts</h3>
          <p className="text-sm text-gray-400 mt-1">
            Existing contracts returned by Circle.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadContracts()}
          disabled={loading}
          className="bg-white text-black rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Contracts"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-yellow-900/60 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-400">
          Loading Circle contracts...
        </p>
      )}

      {!loading && !error && contracts.length === 0 && (
        <p className="rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-gray-400">
          No Circle contracts found.
        </p>
      )}

      <div
        className={
          compact
            ? "space-y-3"
            : "grid grid-cols-1 gap-4 md:grid-cols-2"
        }
      >
        {visibleContracts.map((contract) => (
          <CircleContractItem
            key={contract.id ?? contract.contractAddress}
            contract={contract}
            canImport={Boolean(passport?.wallet)}
            imported={isContractImported(contract, importedIds, deployments)}
            importing={Boolean(contract.id && importingId === contract.id)}
            onImport={() => importContract(contract)}
          />
        ))}
      </div>

      {compact && contracts.length > 1 && (
        <p className="text-sm text-gray-500">
          {contracts.length - 1} more Circle contract
          {contracts.length - 1 === 1 ? "" : "s"} available.
        </p>
      )}
    </section>
  );
}

function isContractImported(
  contract: CircleContract,
  importedIds: Set<string>,
  deployments: Array<{ contract_address: string }>
) {
  if (contract.id && importedIds.has(contract.id)) {
    return true;
  }

  if (!contract.contractAddress) {
    return false;
  }

  const contractAddress = contract.contractAddress.toLowerCase();
  return deployments.some(
    (deployment) =>
      deployment.contract_address.toLowerCase() === contractAddress
  );
}

function CircleContractItem({
  contract,
  canImport,
  imported,
  importing,
  onImport,
}: {
  contract: CircleContract;
  canImport: boolean;
  imported: boolean;
  importing: boolean;
  onImport: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4 space-y-4">
      <div>
        <h4 className="text-base font-bold break-all">
          {contract.name ?? "Unnamed contract"}
        </h4>
        <p className="text-xs text-gray-500 break-all mt-1">
          {contract.contractAddress ?? "No contract address"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <ContractField label="Blockchain" value={contract.blockchain} />
        <ContractField label="Status" value={contract.status} />
        <ContractField label="Created Date" value={contract.createDate} />
        <ContractField label="Updated Date" value={contract.updateDate} />
      </div>

      <button
        type="button"
        onClick={onImport}
        disabled={!canImport || importing || imported || !contract.id}
        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {imported
          ? "Imported"
          : importing
            ? "Importing..."
            : "Import to ArcPassport"}
      </button>
      {imported && (
        <p className="text-xs text-green-300">Imported to ArcPassport</p>
      )}
    </div>
  );
}

function ContractField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 break-all text-gray-200">{value ?? "N/A"}</p>
    </div>
  );
}
