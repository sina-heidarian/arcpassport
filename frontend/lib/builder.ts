import type { Achievement, Deployment, Passport } from "@/lib/types";

export function getBuilderRank(xp: number) {
  if (xp >= 500) return "Elite Builder";
  if (xp >= 250) return "Advanced Builder";
  if (xp >= 100) return "Active Builder";
  return "New Builder";
}

export function getBuilderBadge(xp: number) {
  if (xp >= 500) return "EL";
  if (xp >= 250) return "AD";
  if (xp >= 100) return "AC";
  return "NW";
}

export function getNextRank(xp: number) {
  if (xp < 100) return "Active Builder";
  if (xp < 250) return "Advanced Builder";
  if (xp < 500) return "Elite Builder";
  return "Max Rank";
}

export function getXpToNextRank(xp: number) {
  if (xp < 100) return 100 - xp;
  if (xp < 250) return 250 - xp;
  if (xp < 500) return 500 - xp;
  return 0;
}

export function getAchievements(
  passport: Passport,
  deployments: Deployment[]
): Achievement[] {
  return [
    {
      title: "First Check-in",
      description: "Complete your first daily check-in",
      unlocked: passport.checkin_xp > 0,
      icon: "01",
    },
    {
      title: "First Contract",
      description: "Deploy your first smart contract on Arc",
      unlocked: deployments.length >= 1,
      icon: "02",
    },
    {
      title: "Builder I",
      description: "Deploy 3 smart contracts",
      unlocked: deployments.length >= 3,
      icon: "03",
    },
    {
      title: "Arc Explorer",
      description: "Complete at least 10 transactions",
      unlocked: passport.tx_count >= 10,
      icon: "04",
    },
    {
      title: "Token Mover",
      description: "Complete at least 10 token transfers",
      unlocked: passport.token_transfers >= 10,
      icon: "05",
    },
    {
      title: "Streak Starter",
      description: "Build a 3-day check-in streak",
      unlocked: passport.streak >= 3,
      icon: "06",
    },
  ];
}

export function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
