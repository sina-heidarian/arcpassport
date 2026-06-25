import StatCard from "@/components/StatCard";
import type { Passport } from "@/lib/types";

type DailyCheckinProps = {
  passport: Passport;
  checkinLoading: boolean;
  onCheckin: () => void;
};

export default function DailyCheckin({
  passport,
  checkinLoading,
  onCheckin,
}: DailyCheckinProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Check-in</h2>
          <p className="text-gray-400 mt-1">Claim daily XP and build your streak.</p>
        </div>

        <button
          onClick={onCheckin}
          disabled={!passport.checkin_available || checkinLoading}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          {checkinLoading
            ? "Claiming..."
            : passport.checkin_available
            ? "Claim Daily XP"
            : "Already Claimed"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Current Streak" value={`${passport.streak} day`} />
        <StatCard
          label="Status"
          value={passport.checkin_available ? "Available" : "Claimed Today"}
        />
      </div>
    </div>
  );
}
