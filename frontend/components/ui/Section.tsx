import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("space-y-[var(--space-section-inner)]", className)}>
      {children}
    </section>
  );
}
