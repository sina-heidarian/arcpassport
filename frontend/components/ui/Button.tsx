import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  disabled?: boolean;
  rel?: string;
  target?: string;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-white text-black hover:bg-blue-100",
  secondary:
    "border border-[var(--color-border-strong)] bg-transparent text-white hover:border-[var(--color-accent)] hover:text-blue-300",
  ghost: "text-[var(--color-text-muted)] hover:text-white",
};

export default function Button({
  children,
  className,
  href,
  disabled = false,
  rel,
  target,
  type = "button",
  onClick,
  variant = "primary",
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center rounded-[var(--radius-button)] px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClassName} rel={rel} target={target}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClassName}
    >
      {children}
    </button>
  );
}
