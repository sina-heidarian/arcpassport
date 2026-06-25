export type Transaction = {
  hash: string;
  short_hash: string;
  type: string;
  status: string;
  timestamp: string;
  from: string | null;
  to: string | null;
};

export type Passport = {
  wallet: string;
  level: number;
  xp: number;
  reputation: number;
  tx_count: number;
  nft_count: number;
  streak: number;
  rank: number;
  contract_calls: number;
  token_transfers: number;
  tokens_count: number;
  balance: number;
  checkin_available: boolean;
  checkin_xp: number;
  deployment_count: number;
  deployment_xp: number;
  recent_transactions: Transaction[];
};

export type LeaderboardUser = {
  wallet: string;
  xp: number;
  streak: number;
  checkin_xp: number;
  deployment_xp: number;
  rank: number;
};

export type Deployment = {
  contract_address: string;
  tx_hash: string;
  created_at: string;
};

export type Achievement = {
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
};
