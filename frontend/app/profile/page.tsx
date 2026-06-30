"use client";

import { usePassportContext } from "@/components/PassportProvider";
import ProfileSettings from "@/components/ProfileSettings";
import { Card, EmptyState, PageHeader, PageShell } from "@/components/ui";

export default function ProfilePage() {
  const { isConnected, passport, loading, refreshing, error, refreshPassport } =
    usePassportContext();

  return (
    <PageShell active="dashboard">
      <PageHeader
        eyebrow="Profile"
        title="Builder Profile Settings"
        description="Manage the public details shown on your ArcPassport."
      />

        {!isConnected && (
          <EmptyState
            title="Connect your wallet"
            description="Connect your wallet to edit your ArcPassport profile."
          />
        )}

        {isConnected && loading && (
          <Card className="text-gray-400">
            Loading profile settings...
          </Card>
        )}

        {isConnected && !loading && error && (
          <Card className="text-red-300">
            {error}
          </Card>
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
    </PageShell>
  );
}
