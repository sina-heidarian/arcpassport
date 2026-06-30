import type { ReactNode } from "react";
import Card from "./Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="text-center">
      <h2 className="text-heading text-2xl font-bold">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
