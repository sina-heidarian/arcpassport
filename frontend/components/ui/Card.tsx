import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "muted" | "elevated";
};

export default function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "glass-card rounded-[var(--radius-card)] border p-[var(--space-card)] transition duration-300",
        variant === "default" &&
          "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        variant === "muted" &&
          "border-[var(--color-border-muted)] bg-[var(--color-surface-muted)]",
        variant === "elevated" &&
          "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </div>
  );
}
