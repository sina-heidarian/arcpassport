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
  display_name: string | null;
  bio: string | null;
  x_handle: string | null;
  website: string | null;
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
  quest_xp: number;
  xp_breakdown: {
    onchain_xp: number;
    deployment_xp: number;
    checkin_xp: number;
    quest_xp: number;
    total_xp: number;
  };
  achievements: Achievement[];
  recent_transactions: Transaction[];
};

export type LeaderboardUser = {
  wallet: string;
  xp: number;
  streak: number;
  checkin_xp: number;
  deployment_count: number;
  deployment_xp: number;
  builder_rank: string;
  achievements_unlocked: number;
  rank: number;
};

export type PlatformStats = {
  total_builders: number;
  total_deployments: number;
  total_checkin_xp: number;
  top_builder: {
    wallet: string | null;
    xp: number;
    streak: number;
  };
};

export type Deployment = {
  contract_address: string;
  tx_hash: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  icon: string;
};

export type QuestStatus = "completed" | "in_progress" | "locked";

export type Quest = {
  id: number;
  title: string;
  description: string;
  category: "Onchain" | "Deploy" | "Social" | "Learning" | "Builder";
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  is_repeatable: boolean;
  progress?: number;
  target?: number;
  status?: QuestStatus;
  completed?: boolean;
  in_progress?: boolean;
  locked?: boolean;
  claimable?: boolean;
  claimed_xp?: number;
  completed_at?: string | null;
};

export type QuestSummary = {
  total: number;
  completed: number;
  in_progress: number;
  locked: number;
  total_xp_available: number;
  total_xp_completed: number;
};

export type QuestListResponse = {
  quests: Quest[];
};

export type WalletQuestsResponse = {
  wallet: string;
  summary: QuestSummary;
  quests: Quest[];
};

export type QuestClaimResponse = {
  success: boolean;
  message: string;
  wallet: string;
  quest_id: number;
  xp_reward: number;
  completed_at: string;
};

export type PassportNftAttribute = {
  trait_type: string;
  value: string | number;
};

export type PassportNftMetadata = {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: PassportNftAttribute[];
};

export type PassportNftRequirement = {
  label: string;
  met: boolean;
  current: number;
  target: number;
};

export type PassportNftEligibility = {
  eligible: boolean;
  reason: string;
  requirements: PassportNftRequirement[];
};

export type PassportNftStatus = {
  configured: boolean;
  contract_address: string | null;
  network: string;
  explorer_url: string | null;
};

export type PassportNftContractInfo = {
  name: string | null;
  symbol: string | null;
  owner: string | null;
  totalSupply: number | null;
  contract_address: string;
  network: string;
  explorer_url: string;
};

export type PassportNftOwnership = {
  wallet: string;
  owns_passport: boolean;
  token_id: number | null;
  token_uri: string | null;
  contract_address: string;
  explorer_url: string;
};

export type PassportNftTokenUri = {
  wallet: string;
  token_uri: string;
};

export type PassportNftMintResponse = {
  success: boolean;
  wallet: string;
  tx_hash: string | null;
  receipt_tx_hash?: string | null;
  block_number?: number | null;
  contract_address: string;
  token_id: number | null;
  token_uri: string | null;
  explorer_url: string;
  already_minted: boolean;
  message: string;
};

export type SyncStatus = {
  wallet: string;
  last_sync: string | null;
  syncing: boolean;
  latest_block: number | null;
  network: string;
};

export type SyncResponse = {
  wallet: string;
  synced: boolean;
  cached: boolean;
  transactions: number;
  latest_transactions: Transaction[];
  contract_calls: number;
  token_transfers: number;
  balance: number;
  deployments: number;
  imported_deployments: number;
  xp: number;
  reputation: number;
  rank: number;
  deployment_xp: number;
  achievements: Achievement[];
  latest_block: number | null;
  network: string;
  timestamp: string | null;
  message?: string | null;
};
