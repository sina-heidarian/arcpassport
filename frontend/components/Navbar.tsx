"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

type NavbarProps = {
  active?:
    | "home"
    | "dashboard"
    | "workspace"
    | "quests"
    | "leaderboard"
    | "faucet"
    | "integrations";
  compact?: boolean;
};

const links = [
  { href: "/", label: "Home", key: "home" },
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/tools", label: "Workspace", key: "workspace" },
  { href: "/quests", label: "Quests", key: "quests" },
  { href: "/leaderboard", label: "Leaderboard", key: "leaderboard" },
  { href: "/faucet", label: "Faucet", key: "faucet" },
  { href: "/integrations", label: "Integrations", key: "integrations" },
];

export default function Navbar({ active = "home", compact }: NavbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <h1 className={compact ? "text-2xl font-bold" : "text-4xl font-bold"}>
          ArcPassport
        </h1>
        <p className="text-gray-400 mt-2">{subtitleFor(active)}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium xl:gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                active === link.key
                  ? "text-blue-400"
                  : "text-white hover:text-gray-300"
              }
            >
              {link.label}
            </Link>
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

        <div className="shrink-0">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

function subtitleFor(active: NonNullable<NavbarProps["active"]>) {
  if (active === "dashboard") return "Your Arc builder dashboard";
  if (active === "workspace") return "Builder Workspace";
  if (active === "quests") return "Arc builder quests";
  if (active === "leaderboard") return "Arc builder rankings";
  if (active === "faucet") return "Arc Testnet Faucet";
  if (active === "integrations") return "Circle integration blueprints";
  return "Build Your Onchain Legacy on Arc";
}
