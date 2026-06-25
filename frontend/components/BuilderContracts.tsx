import type { Deployment } from "@/lib/types";

type BuilderContractsProps = {
  deployments: Deployment[];
};

export default function BuilderContracts({ deployments }: BuilderContractsProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Builder Contracts</h2>

      {deployments.length === 0 && (
        <p className="text-gray-500">No contracts deployed yet.</p>
      )}

      <div className="space-y-3">
        {deployments.map((deployment, index) => (
          <div
            key={deployment.tx_hash}
            className="bg-black border border-zinc-800 rounded-xl p-4 space-y-2"
          >
            <p className="text-gray-400">#{index + 1}</p>

            <p className="break-all">
              Contract:{" "}
              <a
                href={`https://testnet.arcscan.app/address/${deployment.contract_address}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300"
              >
                {deployment.contract_address}
              </a>
            </p>

            <p className="break-all">
              Deploy Tx:{" "}
              <a
                href={`https://testnet.arcscan.app/tx/${deployment.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-300"
              >
                {deployment.tx_hash}
              </a>
            </p>

            <p className="text-gray-400">
              Created: {new Date(deployment.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
