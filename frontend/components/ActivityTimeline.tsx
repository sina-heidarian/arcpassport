import type { Achievement, Deployment, Transaction } from "@/lib/types";

type ActivityTimelineProps = {
  recentTransactions: Transaction[];
  deployments: Deployment[];
  achievements: Achievement[];
};

type TimelineItem = {
  icon: string;
  title: string;
  description: string;
  timestamp?: string;
  link?: string;
};

export default function ActivityTimeline({
  recentTransactions,
  deployments,
  achievements,
}: ActivityTimelineProps) {
  const timeline = buildTimeline(recentTransactions, deployments, achievements);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Activity Timeline</h2>

      {timeline.length === 0 && (
        <p className="text-gray-500">No builder activity found yet.</p>
      )}

      <div className="space-y-3">
        {timeline.map((item, index) => (
          <div
            key={`${item.title}-${item.description}-${index}`}
            className="bg-black border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-sm text-blue-300">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-bold">{item.title}</p>
                  {item.timestamp && (
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-300 break-all"
                  >
                    {item.description}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 break-all">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildTimeline(
  recentTransactions: Transaction[],
  deployments: Deployment[],
  achievements: Achievement[]
) {
  const deploymentItems: TimelineItem[] = deployments.map((deployment) => ({
    icon: "DEP",
    title: "Contract Deployed",
    description: shortAddress(deployment.contract_address),
    timestamp: deployment.created_at,
    link: `https://testnet.arcscan.app/address/${deployment.contract_address}`,
  }));

  const transactionItems: TimelineItem[] = recentTransactions.map((tx) => ({
    icon: "TX",
    title: tx.type || "Transaction",
    description: tx.short_hash,
    timestamp: tx.timestamp,
    link: `https://testnet.arcscan.app/tx/${tx.hash}`,
  }));

  const datedItems = [...deploymentItems, ...transactionItems].sort(
    (first, second) => timestampValue(second.timestamp) - timestampValue(first.timestamp)
  );

  const achievementItems: TimelineItem[] = achievements
    .filter((achievement) => achievement.unlocked)
    .map((achievement) => ({
      icon: achievement.icon,
      title: "Achievement Unlocked",
      description: achievement.title,
    }));

  return [...datedItems, ...achievementItems];
}

function timestampValue(timestamp?: string) {
  if (!timestamp) return 0;
  const value = new Date(timestamp).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
