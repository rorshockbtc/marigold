/**
 * Canonical Pipes Protocol Economics & Subscription Tiers for Marigold
 *
 * Synced with `pipes-unified/src/lib/ledger/economics.ts` and `subscription-tiers.ts`.
 */

export const CREDIT_UNIT_USD = 0.005; // 1 credit = $0.005 (half a cent)

export const REVENUE_SPLIT = {
  pipesBps: 7500, // 75% to Pipes platform & infrastructure
  userPoolBps: 2500, // 25% converted into user's monthly credit pool
} as const;

export const QUERY_SPLIT = {
  curatorBps: 7000, // 70% to curator(s) of queried Pipe(s)
  pipesBps: 3000, // 30% to Pipes protocol
} as const;

export const CURATOR_INTERNAL_SPLIT = {
  registrantFloorBps: 2500, // 25% minimum floor to original namespace registrant
  contributorsPoolBps: 7500, // 75% distributed pro-rata by query citation weight
} as const;

export const ACTION_PRICES = {
  readNodeCredits: 1,
  postNodeCredits: 1,
  externalMcpQueryCredits: 2, // 2 credits ($0.01) per external MCP/API query
  firstPartyMarigoldHarnessCredits: 10, // 50% CHB first-party discount (vs 21 for 3rd-party)
  thirdPartyHarnessCredits: 21,
  btcYear1DiscountPercent: 21,
} as const;

export interface PipesSubscriptionTierSummary {
  id: 'free' | 'supporter' | 'curator' | 'patron' | 'classroom' | 'business';
  name: string;
  priceUsd: number;
  interval: 'free' | 'month' | 'year';
  monthlyCredits: number;
  summary: string;
}

export const PIPES_SUBSCRIPTION_TIERS: PipesSubscriptionTierSummary[] = [
  {
    id: 'free',
    name: 'Free Reader',
    priceUsd: 0,
    interval: 'free',
    monthlyCredits: 100,
    summary: 'Private personal pipe, 100 free deep-reads/month, unlimited local DuckDB-Wasm compute.',
  },
  {
    id: 'supporter',
    name: 'Comma ($5/mo)',
    priceUsd: 5,
    interval: 'month',
    monthlyCredits: 250,
    summary: 'BYOK + Trim (~), up to 10 pipes, ~250 credits/mo, entry into 70% curator royalty pool.',
  },
  {
    id: 'curator',
    name: 'Period ($21/mo)',
    priceUsd: 21,
    interval: 'month',
    monthlyCredits: 1050,
    summary: 'Unlimited BYOK + Trim (~), 1 free registered Pipe ($60 value), ~1,050 credits/mo.',
  },
  {
    id: 'patron',
    name: 'Ellipsis ($47/mo)',
    priceUsd: 47,
    interval: 'month',
    monthlyCredits: 2350,
    summary: 'Unlimited pipes, ~2,350 credits/mo, custom 1¢–5¢ external AI microtolls.',
  },
  {
    id: 'classroom',
    name: 'Classrooms & Working Groups ($299/yr)',
    priceUsd: 299,
    interval: 'year',
    monthlyCredits: 1050,
    summary: 'Private civic/cohort group pipe, full year of Period ($21/mo) tier, shared audit playbooks.',
  },
  {
    id: 'business',
    name: 'Business & Jurisdiction Portal ($2,500/yr)',
    priceUsd: 2500,
    interval: 'year',
    monthlyCredits: 12500,
    summary: 'Turnkey sovereign data portal (/c/[jurisdiction]), OpenTimestamps compliance, dedicated support.',
  },
];

export function calculateMonthlyCredits(planPriceUsd: number): number {
  if (planPriceUsd <= 0) return 0;
  const poolUsd = (planPriceUsd * REVENUE_SPLIT.userPoolBps) / 10000;
  return Math.round(poolUsd / CREDIT_UNIT_USD);
}

export function estimateMarigoldCuratorRoyalties(params: {
  monthlyExternalMcpQueries: number;
  monthlySubscriberReads: number;
  isClaimedJurisdiction?: boolean;
}) {
  const mcpCredits = params.monthlyExternalMcpQueries * ACTION_PRICES.externalMcpQueryCredits;
  const readCredits = params.monthlySubscriberReads * ACTION_PRICES.readNodeCredits;
  const totalGrossCredits = mcpCredits + readCredits;

  const curatorCredits = Math.floor((totalGrossCredits * QUERY_SPLIT.curatorBps) / 10000);
  const pipesPlatformCredits = totalGrossCredits - curatorCredits;

  const curatorUsd = Number((curatorCredits * CREDIT_UNIT_USD).toFixed(2));
  const pipesUsd = Number((pipesPlatformCredits * CREDIT_UNIT_USD).toFixed(2));

  return {
    totalGrossCredits,
    curatorCredits,
    pipesPlatformCredits,
    curatorUsd,
    pipesUsd,
    escrowStatus: params.isClaimedJurisdiction
      ? 'Direct Curator Payout Active (70% Share)'
      : 'Unclaimed Jurisdiction Escrow Active (Held in cryptographic escrow until claimed via ECDSA/Nostr)',
  };
}
