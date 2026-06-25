import Navbar from "@/components/Navbar";

const tools = [
  {
    title: "Circle Faucet",
    description: "Request Arc Testnet USDC, EURC, and cirBTC.",
    href: "/faucet",
    cta: "Open faucet",
  },
  {
    title: "ArcScan",
    description: "Inspect wallets, transactions, contracts, and token activity.",
    href: "https://testnet.arcscan.app",
    cta: "Open explorer",
  },
  {
    title: "Deploy Contract",
    description: "Deploy the starter counter contract and earn Builder XP.",
    href: "/",
    cta: "Go to deploy",
  },
  {
    title: "Infinity Name",
    description: "Prepare your persistent Arc builder identity.",
    href: "https://docs.arc.io/",
    cta: "View docs",
  },
  {
    title: "Arc Docs",
    description: "Explore Arc builder tooling and chain documentation.",
    href: "https://docs.arc.io/",
    cta: "Read Arc docs",
  },
  {
    title: "Circle Docs",
    description: "Review Circle developer products for later integrations.",
    href: "https://developers.circle.com/",
    cta: "Read Circle docs",
  },
  {
    title: "AI Builder",
    description: "Workspace automation and guided build flows are coming soon.",
    href: "#",
    cta: "Coming soon",
    disabled: true,
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="tools" />

        <section className="space-y-3">
          <h2 className="text-3xl font-bold">Builder Workspace</h2>
          <p className="max-w-2xl text-gray-400">
            A focused launchpad for Arc builders: fund, explore, deploy, read,
            and prepare your persistent builder identity.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <a
              key={tool.title}
              href={tool.href}
              target={tool.href.startsWith("http") ? "_blank" : undefined}
              rel={tool.href.startsWith("http") ? "noreferrer" : undefined}
              aria-disabled={tool.disabled}
              className={`rounded-2xl border p-5 transition ${
                tool.disabled
                  ? "pointer-events-none border-zinc-900 bg-zinc-950 opacity-60"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{tool.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{tool.description}</p>
                </div>
                <span className="shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs text-gray-300">
                  {tool.cta}
                </span>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
