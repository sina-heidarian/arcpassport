import Link from "next/link";

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

type OnboardingHeroProps = {
  loadPassportInputId: string;
};

export default function OnboardingHero({
  loadPassportInputId,
}: OnboardingHeroProps) {
  return (
    <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Build Your Onchain Legacy on Arc</h2>
        <p className="max-w-3xl text-gray-400">
          ArcPassport turns your Arc activity into a builder identity with XP,
          reputation, achievements, deployments, and public profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-black border border-zinc-800 rounded-xl p-4"
          >
            <h3 className="font-bold">{feature.title}</h3>
            <p className="text-sm text-gray-400 mt-2">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`#${loadPassportInputId}`}
          className="bg-white text-black rounded-xl px-5 py-3 font-medium text-center"
        >
          Load Passport
        </a>

        <Link
          href="/tools"
          className="bg-black border border-zinc-700 rounded-xl px-5 py-3 font-medium text-white text-center hover:border-zinc-500"
        >
          Open Builder Workspace
        </Link>
      </div>
    </section>
  );
}
