type ProgressBarProps = {
  value: number;
  max: number;
};

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
      <div
        className="h-full rounded-full bg-[var(--color-accent)] transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
