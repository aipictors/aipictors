import { config } from "~/config"
import { USER_MODEL_PLAN_LIMITS } from "~/lib/user-models/constants"
import { getVideoUploadLimits } from "~/utils/video-upload-limit"

export type PlanKey = "FREE" | "LITE" | "STANDARD" | "PREMIUM"

export const PLAN_KEYS: PlanKey[] = ["FREE", "LITE", "STANDARD", "PREMIUM"]

/**
 * 生成1枚あたりのコイン（表示用）
 */
export const GENERATION_COIN_COST = {
  standard: 10,
  highResolution: 20,
  imageToImage: 50,
  nanoBanana: 50,
  nanoBanana2: 100,
} as const

/**
 * 毎日のフリーコインで作れる Gemini Nano Banana の週の枚数（aipictors-api の gemini-allowance と同じ）
 * Nano Banana 2 はこの半分。超えた分はプレミアムコインで作れる
 */
const GEMINI_WEEKLY_IMAGES = {
  FREE: 0,
  LITE: 5,
  STANDARD: 20,
  PREMIUM: 40,
} as const

/**
 * そのプランで選べるアイコン枠の数（サブスクの枠。core の user_avatar_frames で price_coins が null のもの）
 * ライトの枠 18（うちプラン限定 2）、スタンダード限定 2、プレミアム限定 3。上のプランは下のプランの枠も使える
 */
const AVATAR_FRAME_COUNTS = {
  FREE: 0,
  LITE: 18,
  STANDARD: 20,
  PREMIUM: 23,
} as const

const configKey = {
  FREE: "free",
  LITE: "lite",
  STANDARD: "standard",
  PREMIUM: "premium",
} as const

const planName = {
  FREE: "無料",
  LITE: "ライト",
  STANDARD: "スタンダード",
  PREMIUM: "プレミアム",
} as const

const planEnName = {
  FREE: "Free",
  LITE: "Lite",
  STANDARD: "Standard",
  PREMIUM: "Premium",
} as const

const planPrice = {
  FREE: 0,
  LITE: 480,
  STANDARD: 1980,
  PREMIUM: 3980,
} as const

/**
 * 年払いの料金（月額の 10 か月分 = 2 か月分おトク。aipictors-api の pricing.ts と同じ）
 */
const planYearlyPrice = {
  FREE: 0,
  LITE: 4800,
  STANDARD: 19800,
  PREMIUM: 39800,
} as const

export type BillingInterval = "month" | "year"

/**
 * プランごとの特典（表示用）
 * 数値は config.passFeature などから取り、サーバーの判定は変えない
 */
export function getPlanSpec(plan: PlanKey) {
  const key = configKey[plan]
  const isPaid = plan !== "FREE"
  const isStandardOrAbove = plan === "STANDARD" || plan === "PREMIUM"
  const dailyImages = config.passFeature.imageGenerationsCount[key]

  return {
    plan,
    name: planName[plan],
    enName: planEnName[plan],
    price: planPrice[plan],
    yearlyPrice: planYearlyPrice[plan],
    /**
     * 通常生成で1回に作られる枚数
     */
    imagesPerRequest: isPaid ? 4 : 1,
    /**
     * 通常生成での1日の目安
     */
    dailyImages,
    /**
     * 毎日もらえるフリーコイン
     */
    dailyFreeCoins: dailyImages * GENERATION_COIN_COST.standard,
    concurrentTasks: config.passFeature.imageGenerationTasksCount[key],
    loraModels: config.passFeature.imageGenerationLoraModelsCount[key],
    favoriteHistories: config.passFeature.imageGenerationHistoriesCount[key],
    modelSlots: USER_MODEL_PLAN_LIMITS[plan],
    imageToImage: isPaid,
    nanoBanana: isPaid,
    geminiWeeklyImages: GEMINI_WEEKLY_IMAGES[plan],
    nanoBanana2: isStandardOrAbove,
    fastMode: isStandardOrAbove,
    reservation: isStandardOrAbove,
    noAdvertisement: config.passFeature.noAdvertisement[key],
    badge: config.passFeature.badge[key],
    avatarFrames: AVATAR_FRAME_COUNTS[plan],
    video: getVideoUploadLimits(isPaid ? plan : null),
  }
}

export type PlanSpec = ReturnType<typeof getPlanSpec>
