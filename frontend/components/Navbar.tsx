"use client";

import Link from "next/link";
import { useState } from "react";

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
  { href: "/integrations", label: "Integrations", key: "integrations" },
  { href: "/faucet", label: "Faucet", key: "faucet" },
  { href: "https://testnet.arcscan.app", label: "ArcScan", key: "arcscan" },
] as const;

const tabletLinks = links.slice(0, 4);
const moreLinks = links.slice(4);

export default function Navbar({ active = "home" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 -mx-4 border-b border-zinc-800/80 bg-black/85 backdrop-blur-xl sm:-mx-8">
      <div className="relative mx-auto grid h-16 w-full max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-4 pr-20 sm:px-6 sm:pr-72 md:grid-cols-[260px_minmax(0,1fr)] lg:pr-80">
        <Link href="/" className="min-w-0">
          <span className="block whitespace-nowrap text-xl font-bold tracking-tight text-white">
            ArcPassport
          </span>
          <span className="mt-0.5 hidden whitespace-nowrap text-[11px] font-medium text-gray-500 sm:block">
            Build Your Onchain Legacy on Arc
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center gap-7 whitespace-nowrap text-sm font-medium xl:flex">
          {links.map((link) => (
            <NavLink key={link.href} link={link} active={active} />
          ))}
        </nav>

        <nav className="hidden min-w-0 items-center gap-7 whitespace-nowrap text-sm font-medium md:flex xl:hidden">
          {tabletLinks.map((link) => (
            <NavLink key={link.href} link={link} active={active} />
          ))}
          <MoreMenu active={active} />
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-800 text-gray-200 transition hover:border-blue-500 hover:text-blue-400 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <span className="text-lg leading-none">{mobileOpen ? "x" : "="}</span>
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-zinc-800 bg-black/95 px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-2 text-sm font-medium">
            {links.map((link) => (
              <MobileNavLink
                key={link.href}
                link={link}
                active={active}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  link,
  active,
}: {
  link: (typeof links)[number];
  active: NonNullable<NavbarProps["active"]>;
}) {
  const isActive = active === link.key;
  const className = `relative whitespace-nowrap py-2 transition duration-200 ${
    isActive ? "text-white" : "text-gray-400 hover:text-white"
  }`;

  const content = (
    <>
      {link.label}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#3B82F6]" />
      )}
    </>
  );

  if (link.href.startsWith("http")) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}

function MobileNavLink({
  link,
  active,
  onClick,
}: {
  link: (typeof links)[number];
  active: NonNullable<NavbarProps["active"]>;
  onClick: () => void;
}) {
  const isActive = active === link.key;
  const className = `rounded-xl px-3 py-2 transition ${
    isActive
      ? "bg-blue-500/10 text-blue-300"
      : "text-gray-300 hover:bg-zinc-900 hover:text-white"
  }`;

  if (link.href.startsWith("http")) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onClick}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

function MoreMenu({
  active,
}: {
  active: NonNullable<NavbarProps["active"]>;
}) {
  const hasActiveChild = moreLinks.some((link) => link.key === active);

  return (
    <details className="group relative">
      <summary
        className={`list-none cursor-pointer whitespace-nowrap py-2 transition duration-200 marker:hidden ${
          hasActiveChild ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        More
        {hasActiveChild && (
          <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#3B82F6]" />
        )}
      </summary>
      <div className="absolute right-0 top-9 w-48 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/40">
        {moreLinks.map((link) => (
          <MobileNavLink
            key={link.href}
            link={link}
            active={active}
            onClick={() => undefined}
          />
        ))}
      </div>
    </details>
  );
}
