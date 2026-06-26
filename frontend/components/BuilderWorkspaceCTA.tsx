import Link from "next/link";

const workspaceItems = [
  "Deploy contracts",
  "Claim testnet assets",
  "Explore ArcScan",
  "Read Arc and Circle docs",
];

export default function BuilderWorkspaceCTA() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Builder Workspace</h2>
        <p className="text-gray-400 mt-1">
          Access the tools you need to build on Arc.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {workspaceItems.map((item) => (
          <span
            key={item}
            className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-sm text-gray-300"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/tools"
          className="bg-white text-black rounded-xl px-5 py-3 font-medium text-center"
        >
          Open Builder Workspace
        </Link>

        <Link
          href="/tools#builder-zone"
          className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-white text-center hover:border-zinc-500"
        >
          Continue to Deploy
        </Link>
      </div>
    </div>
  );
}
