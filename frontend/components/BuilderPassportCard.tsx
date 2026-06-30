import { cn } from "@/lib/cn";
import { shortWallet } from "@/lib/builder";

type BuilderPassportCardProps = {
  builderName?: string;
  wallet?: string;
  avatarUrl?: string;
  level?: number;
  xp?: number;
  reputation?: number;
  rank?: string | number;
  className?: string;
};

export default function BuilderPassportCard({
  builderName = "Arc Builder",
  wallet = "0x0000000000000000000000000000000000000000",
  avatarUrl,
  level = 1,
  xp = 0,
  reputation = 0,
  rank = "-",
  className,
}: BuilderPassportCardProps) {
  const displayWallet = wallet ? shortWallet(wallet) : "No wallet";
  const initials = getInitials(builderName);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-blue-300/20",
        "bg-white/[0.055] p-[1px] shadow-[0_24px_90px_rgba(37,99,235,0.22)]",
        "transition duration-500 hover:-translate-y-1 hover:border-blue-300/40 hover:shadow-[0_32px_120px_rgba(59,130,246,0.34)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(59,130,246,0.36),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02))]" />
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl transition duration-500 group-hover:bg-blue-400/30" />
      <div className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative rounded-[27px] border border-white/10 bg-zinc-950/72 p-5 backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-blue-200/30 bg-gradient-to-br from-blue-400/30 via-zinc-900 to-cyan-300/20 shadow-[0_0_32px_rgba(59,130,246,0.28)]">
              {avatarUrl ? (
                <div
                  aria-hidden="true"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarUrl})` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-heading text-xl font-bold text-blue-100">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/80">
                Builder Passport
              </p>
              <h3 className="text-heading mt-1 truncate text-2xl font-bold text-white sm:text-3xl">
                {builderName}
              </h3>
              <p className="font-mono mt-1 text-sm text-gray-400">
                {displayWallet}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <PassportBadge label="Soulbound" tone="blue" />
            <PassportBadge label="Arc" tone="cyan" />
            <PassportBadge label="Circle Powered" tone="white" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Level" value={level} />
          <Metric label="XP" value={xp} />
          <Metric label="Reputation" value={reputation} />
          <Metric label="Rank" value={rank} />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Identity Layer
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Verifiable builder progress on Arc
            </p>
          </div>
          <div className="h-10 w-10 rounded-full border border-blue-300/30 bg-blue-400/10 shadow-[0_0_30px_rgba(59,130,246,0.28)]" />
        </div>
      </div>
    </article>
  );
}

function PassportBadge({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "cyan" | "white";
}) {
  const tones = {
    blue: "border-blue-300/30 bg-blue-400/10 text-blue-100",
    cyan: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
    white: "border-white/20 bg-white/10 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone]
      )}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/28 p-4 backdrop-blur-xl transition duration-300 group-hover:border-blue-300/20">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="font-mono mt-2 truncate text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
