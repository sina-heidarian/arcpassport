"use client";

import type { Address, Hash } from "viem";

type DeployCardProps = {
  isConnected: boolean;
  deployPending: boolean;
  deployHash?: Hash;
  contractAddress?: Address;
  deployError?: Error | null;
  onDeploy: () => void;
};

export default function DeployCard({
  isConnected,
  deployPending,
  deployHash,
  contractAddress,
  deployError,
  onDeploy,
}: DeployCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Builder Zone</h2>
      <p className="text-gray-400">
        Deploy your first smart contract on Arc Testnet and earn Builder XP.
      </p>

      <button
        onClick={onDeploy}
        disabled={!isConnected || deployPending}
        className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
      >
        {deployPending ? "Deploying..." : "Deploy Counter Contract"}
      </button>

      {!isConnected && (
        <p className="text-sm text-gray-500">
          Connect your wallet first to deploy a contract.
        </p>
      )}

      {deployHash && (
        <p className="text-sm text-green-400 break-all">
          Deploy transaction: {deployHash}
        </p>
      )}
      {contractAddress && (
        <p className="text-sm text-cyan-400 break-all">Contract: {contractAddress}</p>
      )}
      {deployError && (
        <p className="text-sm text-red-400">Deploy failed: {deployError.message}</p>
      )}
    </div>
  );
}
