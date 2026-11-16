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
  /** 振込予定（最短の締めの日時）。保留中・保留明けのプラスの行だけ。古い API では無い */
  expectedCloseAt?: number | null
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
    /** 締めの日（毎月）。古い API では無い */
    closeDays?: number[]
    /** 本人確認からこの日数のあいだは 1 回 newAccountMaxYen まで */
    newAccountDays?: number
    newAccountMaxYen?: number
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

/** 締めの日の表示（「10 日・25 日」） */
export const formatCloseDays = (config: CreatorRewardSummary["config"]) =>
  (config.closeDays?.length ? config.closeDays : [config.closeDay]).join(
    " 日・",
  )

/** 円の表記。英語の画面は ¥1,000 */
export const formatYen = (value: number, isEnglish = false) =>
  isEnglish
    ? `¥${Math.floor(value).toLocaleString("en-US")}`
    : `${Math.floor(value).toLocaleString("ja-JP")}円`
