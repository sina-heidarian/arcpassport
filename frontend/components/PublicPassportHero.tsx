"use client";

import Link from "next/link";
import { useState } from "react";
import { getBuilderBadge, getBuilderRank, shortWallet } from "@/lib/builder";
import type { Passport } from "@/lib/types";

type PublicPassportHeroProps = {
  passport: Passport;
};

export default function PublicPassportHero({
  passport,
}: PublicPassportHeroProps) {
  const [copied, setCopied] = useState(false);
  const builderRank = getBuilderRank(passport.xp);
  const builderBadge = getBuilderBadge(passport.xp);

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy public passport URL:", error);
    }
  }

  return (
    <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Public Builder Profile</p>
          <div>
            <h2 className="text-3xl font-bold">
              {passport.display_name || "Arc Builder Passport"}
            </h2>
            <p className="text-gray-400 mt-2 break-all">
              {shortWallet(passport.wallet)}
            </p>
            {passport.bio && (
              <p className="max-w-2xl text-gray-300 mt-3">{passport.bio}</p>
            )}
          </div>
          <div className="inline-flex items-center gap-2 bg-black border border-zinc-800 rounded-full px-4 py-2">
            <span className="text-xs text-blue-300">{builderBadge}</span>
            <span className="font-semibold">{builderRank}</span>
          </div>
          {(passport.x_handle || passport.website) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {passport.x_handle && (
                <a
                  href={`https://x.com/${passport.x_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:text-blue-200"
                >
                  {passport.x_handle.startsWith("@")
                    ? passport.x_handle
                    : `@${passport.x_handle}`}
                </a>
              )}
              {passport.website && (
                <a
                  href={normalizeWebsite(passport.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:text-blue-200 break-all"
                >
                  {passport.website}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={copyCurrentUrl}
            className="bg-white text-black rounded-xl px-5 py-3 font-medium"
          >
            Share this Passport
          </button>
          <a
            href={`https://testnet.arcscan.app/address/${passport.wallet}`}
            target="_blank"
            rel="noreferrer"
            className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-center text-white hover:border-zinc-500"
          >
            View on ArcScan
          </a>
          <Link
            href="/"
            className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-center text-white hover:border-zinc-500"
          >
            Back to App
          </Link>
        </div>
      </div>

      {copied && <p className="text-sm text-green-400">Copied!</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <HeroStat label="Level" value={passport.level} />
        <HeroStat label="XP" value={passport.xp} />
        <HeroStat label="Reputation" value={passport.reputation} />
        <HeroStat label="Rank" value={`#${passport.rank}`} />
      </div>
    </section>
  );
}

function normalizeWebsite(website: string) {
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
