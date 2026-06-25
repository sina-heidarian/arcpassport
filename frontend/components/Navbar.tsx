type NavbarProps = {
  active?: "passport" | "faucet" | "tools";
  compact?: boolean;
};

const links = [
  { href: "/", label: "Passport", key: "passport" },
  { href: "/faucet", label: "Faucet", key: "faucet" },
  { href: "/tools", label: "Tools", key: "tools" },
  { href: "/#leaderboard", label: "Leaderboard", key: "leaderboard" },
];

export default function Navbar({ active = "passport", compact }: NavbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={compact ? "text-2xl font-bold" : "text-4xl font-bold"}>
          ArcPassport
        </h1>
        <p className="text-gray-400 mt-2">
          {active === "faucet"
            ? "Arc Testnet Faucet"
            : active === "tools"
            ? "Builder Workspace"
            : "Build Your Onchain Legacy on Arc"}
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={
              active === link.key
                ? "text-blue-400"
                : "text-white hover:text-gray-300"
            }
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://testnet.arcscan.app"
          target="_blank"
          rel="noreferrer"
          className="text-white hover:text-gray-300"
        >
          ArcScan
        </a>
      </nav>
    </div>
  );
}
