import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "blue" | "green" | "yellow" | "red";
};

const tones = {
  neutral: "border-zinc-700 bg-zinc-900 text-gray-300",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  green: "border-green-500/30 bg-green-500/10 text-green-300",
  yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default function Badge({
  children,
  className,
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
