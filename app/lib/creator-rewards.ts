/**
 * クリエイター報酬（推しの換金）の数字。aipictors-api の src/lib/creator-payouts/config.ts と合わせる
 * 設計と根拠: aipictors-api の AGENTS.md「クリエイター報酬」
 */
export const CREATOR_REWARD_TERMS_VERSION = "2026-11-16"

/** 有料コイン 1 枚あたりの報酬（円） */
export const CREATOR_REWARD_YEN_PER_COIN = 0.5

export const CREATOR_REWARD_HOLD_DAYS = 60
export const CREATOR_PAYOUT_MIN_YEN = 3000
export const CREATOR_PAYOUT_MAX_YEN = 100000
export const CREATOR_PAYOUT_FEE_YEN = 500
export const CREATOR_PAYOUT_CLOSE_DAY = 10
/** 個人の源泉徴収（%） */
export const CREATOR_PAYOUT_WITHHOLDING_PERCENT = 10.21

export type CreatorRewardEarning = {
  id: number
  kind: "SUPPORT" | "CLAWBACK" | "ADJUSTMENT"
  workId: string | null
  fromProfile: boolean
  coins: number
  amountYen: number
  status: "HOLDING" | "HELD" | "IN_PAYOUT" | "PAID" | "REVERSED"
  availableAt: number
  reversedReason: string | null
  createdAt: number
}

export type CreatorRewardPayout = {
  id: string
  period: string
  status:
    | "AWAITING_APPROVAL"
    | "READY"
    | "SENDING"
    | "SENT"
    | "FAILED"
    | "CANCELED"
  grossYen: number
  withholdingYen: number
  feeYen: number
  netYen: number
  earningsCount: number
  sentAt: number | null
  createdAt: number
  error: string | null
}

export type CreatorRewardSummary = {
  config: {
    enabled: boolean
    termsVersion: string
    rateMilliyen: number
    holdDays: number
    minYen: number
    maxYen: number
    feeYen: number
    withholdingPpm: number
    closeDay: number
    stripeMode: "test" | "live"
  }
  joined: boolean
  profile: {
    status: "JOINED" | "LEFT" | "SUSPENDED"
    termsVersion: string
    joinedAt: number
    hasAccount: boolean
    detailsSubmitted: boolean
    payoutReady: boolean
    taxKind: "INDIVIDUAL" | "CORPORATION" | null
    requirements: {
      currentlyDue: string[]
      pastDue: string[]
      disabledReason: string | null
    } | null
    needsNewTerms: boolean
  } | null
  onboardingAvailable: boolean
  balances: {
    holdingYen: number
    availableYen: number
    inPayoutYen: number
    paidYen: number
    reversedYen: number
    totalCoins: number
  }
  nextCloseAt: number
  earnings: CreatorRewardEarning[]
  payouts: CreatorRewardPayout[]
}

export const formatYen = (value: number) =>
  `${Math.floor(value).toLocaleString("ja-JP")}円`
