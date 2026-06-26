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

export function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
