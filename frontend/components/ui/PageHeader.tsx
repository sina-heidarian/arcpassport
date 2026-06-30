import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-label text-[var(--color-accent)]">{eyebrow}</p>
        )}
        <h1 className="text-heading mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </section>
  );
}
