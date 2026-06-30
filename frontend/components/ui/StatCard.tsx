import Card from "./Card";
import AnimatedCounter from "./AnimatedCounter";

type StatCardProps = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

export default function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <Card
      className={`hover:-translate-y-0.5 hover:border-blue-300/30 ${
        highlight ? "border-green-800 bg-green-950/30" : ""
      }`}
    >
      <p className={highlight ? "text-xs text-green-300" : "text-xs text-gray-500"}>
        {label}
      </p>
      <p className="font-mono mt-1 text-2xl font-bold text-[var(--color-text)]">
        <AnimatedCounter value={value} />
      </p>
    </Card>
  );
}
