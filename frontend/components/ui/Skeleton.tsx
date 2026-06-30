import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-card)] border border-white/5 bg-gradient-to-r from-zinc-900 via-zinc-800/70 to-zinc-900",
        className
      )}
    />
  );
}
