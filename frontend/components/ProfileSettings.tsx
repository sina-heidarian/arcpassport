"use client";

import { useState } from "react";
import { apiPatch } from "@/lib/api";
import type { Passport } from "@/lib/types";

type ProfileSettingsProps = {
  passport: Passport;
  onSaved: () => Promise<void>;
};

type ProfilePayload = {
  display_name: string | null;
  bio: string | null;
  x_handle: string | null;
  website: string | null;
};

export default function ProfileSettings({
  passport,
  onSaved,
}: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(passport.display_name ?? "");
  const [bio, setBio] = useState(passport.bio ?? "");
  const [xHandle, setXHandle] = useState(passport.x_handle ?? "");
  const [website, setWebsite] = useState(passport.website ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveProfile() {
    setSaving(true);
    setSaved(false);

    const payload: ProfilePayload = {
      display_name: emptyToNull(displayName),
      bio: emptyToNull(bio),
      x_handle: emptyToNull(xHandle),
      website: emptyToNull(website),
    };

    try {
      await apiPatch(`/passport/${passport.wallet}/profile`, payload);
      await onSaved();
      setSaved(true);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="text-gray-400 mt-1">
          Customize how your public builder profile appears.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Display Name"
          value={displayName}
          maxLength={40}
          onChange={setDisplayName}
        />
        <Field
          label="X Handle"
          value={xHandle}
          maxLength={30}
          onChange={setXHandle}
        />
        <Field
          label="Website"
          value={website}
          maxLength={120}
          onChange={setWebsite}
        />
      </div>

      <div>
        <label className="text-sm text-gray-400">Bio</label>
        <textarea
          className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3 text-white"
          value={bio}
          maxLength={160}
          rows={3}
          onChange={(event) => setBio(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {saved && <p className="text-sm text-green-400">Profile saved</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        className="w-full mt-2 bg-black border border-zinc-700 rounded-xl p-3 text-white"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
