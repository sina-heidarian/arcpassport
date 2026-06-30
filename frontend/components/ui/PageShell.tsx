import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

type PageShellProps = {
  active:
    | "home"
    | "dashboard"
    | "workspace"
    | "quests"
    | "leaderboard"
    | "faucet"
    | "integrations";
  children: ReactNode;
  width?: "default" | "wide" | "narrow";
};

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
};

export default function PageShell({
  active,
  children,
  width = "default",
}: PageShellProps) {
  return (
    <main className="app-background min-h-screen overflow-hidden bg-[var(--color-bg)] p-4 text-[var(--color-text)] sm:p-8">
      <div
        className={`page-transition relative z-10 mx-auto space-y-[var(--space-page)] ${widths[width]}`}
      >
        <Navbar active={active} />
        {children}
      </div>
    </main>
  );
}
