import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PillProps = {
  children: ReactNode;
  className?: string;
};

export default function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)]",
        className
      )}
    >
      {children}
    </span>
  );
}
