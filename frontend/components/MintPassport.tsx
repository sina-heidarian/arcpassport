"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

type MintMetadata = {
  name: string;
  description: string;
  level: number;
  xp: number;
  reputation: number;
  rank: number;
};

type MintResponse = {
  success: boolean;
  message: string;
  wallet: string;
  status: string;
  metadata: MintMetadata;
};

type MintPassportProps = {
  wallet: string;
};

export default function MintPassport({ wallet }: MintPassportProps) {
  const [loading, setLoading] = useState(false);
  const [mintPreview, setMintPreview] = useState<MintResponse | null>(null);

  async function prepareMint() {
    setLoading(true);

    try {
      const data = await apiPost<MintResponse>(`/passport/${wallet}/mint`);
      setMintPreview(data);
    } catch (error) {
      console.error("Failed to prepare passport mint:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Builder Passport NFT</h2>
          <p className="text-gray-400 mt-1">
            Mint your onchain builder identity for Arc.
          </p>
        </div>

        <button
          onClick={prepareMint}
          disabled={loading}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Preparing..." : "Prepare Mint"}
        </button>
      </div>

      {mintPreview && (
        <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-gray-500 text-sm">Status</p>
            <p className="font-semibold">{mintPreview.message}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewItem label="Name" value={mintPreview.metadata.name} />
            <PreviewItem label="Level" value={mintPreview.metadata.level} />
            <PreviewItem label="XP" value={mintPreview.metadata.xp} />
            <PreviewItem
              label="Reputation"
              value={mintPreview.metadata.reputation}
            />
            <PreviewItem label="Rank" value={`#${mintPreview.metadata.rank}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}
