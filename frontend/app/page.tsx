"use client";

import Link from "next/link";
import GlobalStats from "@/components/GlobalStats";
import Navbar from "@/components/Navbar";
import { usePassportContext } from "@/components/PassportProvider";
import TodaysQuest from "@/components/TodaysQuest";
import { useStats } from "@/hooks/useStats";

const features = [
  {
    title: "Track Activity",
    description:
      "Measure transactions, contract calls, token transfers, and balances.",
  },
  {
    title: "Earn Builder XP",
    description: "Gain XP from check-ins, deployments, and onchain activity.",
  },
  {
    title: "Deploy Contracts",
    description: "Deploy smart contracts and build your Arc reputation.",
  },
  {
    title: "Share Passport",
    description:
      "Create a public builder profile you can share with the community.",
  },
];

export default function Home() {
  const { stats } = useStats();
  const { isConnected } = usePassportContext();

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar active="home" />

        <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold">
              Build Your Onchain Legacy on Arc
            </h2>
            <p className="max-w-3xl text-gray-400">
              ArcPassport turns Arc activity into builder identity with XP,
              reputation, deployments, achievements, and public profiles.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="bg-white text-black rounded-xl px-5 py-3 font-medium text-center"
            >
              {isConnected ? "Open Dashboard" : "Connect Wallet"}
            </Link>
            <Link
              href="/tools"
              className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-white text-center hover:border-zinc-500"
            >
              Open Builder Workspace
            </Link>
          </div>
        </section>

        {isConnected ? <TodaysQuest /> : <StartQuestCTA />}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-gray-400 mt-2">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <GlobalStats stats={stats} />
      </div>
    </main>
  );
}

function StartQuestCTA() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Start your first Builder Quest</h2>
          <p className="mt-1 text-sm text-gray-400">
            Preview ArcPassport goals, then connect wallet to track progress.
          </p>
        </div>
        <Link
          href="/quests"
          className="rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
        >
          Open Quests
        </Link>
      </div>
    </section>
  );
}
