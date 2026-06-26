"use client";

import Navbar from "@/components/Navbar";
import { usePassportContext } from "@/components/PassportProvider";
import ProfileSettings from "@/components/ProfileSettings";

export default function ProfilePage() {
  const { isConnected, passport, loading, refreshing, error, refreshPassport } =
    usePassportContext();

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="dashboard" />

        {!isConnected && (
          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold">Connect your wallet</h2>
            <p className="text-gray-400 mt-2">
              Connect your wallet to edit your ArcPassport profile.
            </p>
          </div>
        )}

        {isConnected && loading && (
          <div className="bg-zinc-900 rounded-2xl p-6 text-gray-400">
            Loading profile settings...
          </div>
        )}

        {isConnected && !loading && error && (
          <div className="bg-zinc-900 rounded-2xl p-6 text-red-300">
            {error}
          </div>
        )}

        {passport && refreshing && (
          <p className="text-sm text-gray-500">Refreshing profile...</p>
        )}

        {passport && (
          <ProfileSettings
            passport={passport}
            onSaved={async () => {
              await refreshPassport(true);
            }}
          />
        )}
      </div>
    </main>
  );
}
