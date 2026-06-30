import { StatCard as UiStatCard } from "@/components/ui";

type StatCardProps = {
  label: string | number;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return <UiStatCard label={String(label)} value={value} />;
}
