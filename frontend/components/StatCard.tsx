type StatCardProps = {
  label: string | number;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
