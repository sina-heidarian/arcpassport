import type { ReactNode } from "react";
import {
  Button,
  Card,
  FeatureCard,
  PageHeader,
  PageShell,
  Section,
} from "@/components/ui";

const identityCards = [
  {
    title: "Builder Passport",
    description: "A public builder identity that grows with your Arc activity.",
  },
  {
    title: "Build & Prove",
    description: "Track transactions, deployments, contract activity, and quests.",
  },
  {
    title: "Reputation",
    description: "Earn XP, unlock achievements, and climb the builder leaderboard.",
  },
];

const steps = [
  {
    title: "Connect Wallet",
    description: "Start with the wallet you use to build and experiment on Arc.",
  },
  {
    title: "Build on Arc",
    description: "Create transactions, deploy contracts, and generate real activity.",
  },
  {
    title: "Complete Quests",
    description: "Follow guided builder goals that turn progress into XP.",
  },
  {
    title: "Mint Builder Passport",
    description: "Turn your progress into a soulbound builder identity.",
  },
];

const coreFeatures = [
  {
    title: "Builder XP",
    description: "A clear score that reflects your Arc activity and progress.",
  },
  {
    title: "Quest Engine",
    description: "Guided goals that help builders know what to do next.",
  },
  {
    title: "Daily Check-ins",
    description: "Keep a lightweight builder rhythm and grow your streak.",
  },
  {
    title: "Achievements",
    description: "Unlock visible proof for milestones across your builder journey.",
  },
  {
    title: "Leaderboard",
    description: "Compare builder progress through XP, deployments, and activity.",
  },
  {
    title: "Public Passport",
    description: "Share a clean public profile for any Arc builder wallet.",
  },
  {
    title: "Circle Wallets",
    description: "Surface Circle developer wallet infrastructure inside ArcPassport.",
  },
  {
    title: "Circle Contracts",
    description: "View and import Circle contracts into builder progress.",
  },
  {
    title: "Soulbound Passport NFT",
    description: "Represent builder identity with a non-transferable Passport NFT.",
  },
];

export default function Home() {
  return (
    <PageShell active="home" width="wide">
        <div className="space-y-28 pb-20 pt-10 sm:pt-16 lg:space-y-36">
          <section className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950 px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="max-w-5xl">
              <PageHeader
                eyebrow="ArcPassport v1.0 Beta"
                title="Build Your Onchain Builder Identity"
                description="ArcPassport turns your Arc activity into a verifiable builder passport with XP, quests, reputation, Circle-powered infrastructure, and a Soulbound Passport NFT."
              />
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href="/dashboard" className="px-7 py-4">
                  Get Started
                </Button>
                <Button href="/tools" variant="secondary" className="px-7 py-4">
                  View Demo Flow
                </Button>
              </div>
            </div>
          </section>

          <LandingSection
            eyebrow="What is ArcPassport?"
            title="A builder identity layer for Arc."
            description="ArcPassport helps builders understand, prove, and share what they are building on Arc."
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {identityCards.map((card) => (
                <Card
                  key={card.title}
                  className="min-h-64 rounded-[28px] p-8"
                >
                  <h3 className="text-heading text-2xl font-bold">
                    {card.title}
                  </h3>
                  <p className="mt-5 text-base leading-7 text-[var(--color-text-muted)]">
                    {card.description}
                  </p>
                </Card>
              ))}
            </div>
          </LandingSection>

          <LandingSection
            eyebrow="How it works"
            title="A simple path from wallet activity to public proof."
            description="ArcPassport gives builders a clear flow without exposing raw infrastructure or internal dashboard data on the landing page."
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
              {steps.map((step, index) => (
                <Card
                  key={step.title}
                  className="relative rounded-3xl border border-zinc-800 bg-zinc-950 p-7"
                >
                  {index < steps.length - 1 && (
                    <div className="absolute left-12 top-11 hidden h-px w-[calc(100%_-_48px)] bg-zinc-800 lg:block" />
                  )}
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-sm font-bold text-blue-300">
                    {index + 1}
                  </div>
                  <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </LandingSection>

          <LandingSection
            eyebrow="Core Features"
            title="Built for identity, progress, and proof."
            description="The dashboard contains the live data. Home stays focused on the product story."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </LandingSection>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[32px] p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
                Powered by Circle
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                Infrastructure signals become builder identity.
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
                ArcPassport uses Circle infrastructure to read developer wallets
                and contracts, import real builder activity, and connect
                infrastructure data to builder identity.
              </p>
            </Card>

            <Card className="rounded-[32px] p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
                Built for Arc Builders
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                A home for testnet progress.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                ArcPassport is designed for builders experimenting on Arc
                Testnet, tracking their activity, and turning their progress
                into an onchain identity.
              </p>
            </Card>
          </section>

          <section className="rounded-[32px] border border-zinc-800 bg-white px-6 py-14 text-center text-black sm:px-10 lg:px-16">
            <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to build your Arc identity?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              Open your dashboard, connect a wallet, and start turning builder
              activity into a passport others can understand.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/dashboard" className="bg-black px-7 py-4 text-white hover:bg-zinc-800">
                Open Dashboard
              </Button>
              <Button href="/quests" variant="secondary" className="border-zinc-300 px-7 py-4 text-black hover:border-zinc-500 hover:text-black">
                Explore Quests
              </Button>
            </div>
          </section>
        </div>
    </PageShell>
  );
}

function LandingSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Section>
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-300">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-lg leading-8 text-gray-400">{description}</p>
      </div>
      {children}
    </Section>
  );
}
