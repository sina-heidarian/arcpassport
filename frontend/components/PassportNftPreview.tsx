import type {
  PassportNftEligibility,
  PassportNftMetadata,
} from "@/lib/types";

type PassportNftPreviewProps = {
  metadata: PassportNftMetadata | null;
  eligibility?: PassportNftEligibility | null;
  compact?: boolean;
};

export default function PassportNftPreview({
  metadata,
  eligibility,
  compact,
}: PassportNftPreviewProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
            Passport NFT
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Future Builder Passport
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Soulbound Builder Passport NFT architecture is prepared for a future
            mint flow. No NFT is minted yet.
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-yellow-700/60 bg-yellow-950/30 px-3 py-1 text-xs font-medium text-yellow-200">
          Coming Soon
        </span>
      </div>

      {metadata ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-xl border border-zinc-800 bg-black p-5">
            <div className="flex aspect-square items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-center">
              <div>
                <p className="text-sm text-gray-500">Preview Image</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  ArcPassport
                </p>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-bold">{metadata.name}</h3>
            <p className="mt-2 text-sm text-gray-400">
              {metadata.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {metadata.attributes.map((attribute) => (
                <div
                  key={attribute.trait_type}
                  className="rounded-xl border border-zinc-800 bg-black p-4"
                >
                  <p className="text-xs text-gray-500">
                    {attribute.trait_type}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {attribute.value}
                  </p>
                </div>
              ))}
            </div>

            {!compact && eligibility && (
              <RequirementsChecklist eligibility={eligibility} />
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-black p-4 text-sm text-gray-400">
          Connect or load a wallet to preview Builder Passport metadata.
        </div>
      )}
    </section>
  );
}

export function RequirementsChecklist({
  eligibility,
}: {
  eligibility: PassportNftEligibility;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">Requirements Checklist</h3>
          <p className="mt-1 text-sm text-gray-400">{eligibility.reason}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            eligibility.eligible
              ? "border-green-700 bg-green-950/40 text-green-300"
              : "border-zinc-700 bg-zinc-950 text-gray-300"
          }`}
        >
          {eligibility.eligible ? "Eligible" : "Not Ready"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {eligibility.requirements.map((requirement) => (
          <div
            key={requirement.label}
            className="flex items-center justify-between gap-4 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{requirement.label}</p>
              <p className="text-xs text-gray-500">
                {requirement.current}/{requirement.target}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                requirement.met
                  ? "bg-green-950/60 text-green-300"
                  : "bg-zinc-800 text-gray-400"
              }`}
            >
              {requirement.met ? "Ready" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
