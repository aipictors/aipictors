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
  highResolution: 30,
  imageToImage: 50,
  nanoBanana: 50,
  nanoBanana2: 100,
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
    /**
     * 通常生成で1回に作られる枚数
     */
    imagesPerRequest: isPaid ? 4 : 2,
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
    nanoBanana2: isStandardOrAbove,
    fastMode: isStandardOrAbove,
    reservation: isStandardOrAbove,
    noAdvertisement: config.passFeature.noAdvertisement[key],
    badge: config.passFeature.badge[key],
    video: getVideoUploadLimits(isPaid ? plan : null),
  }
}

export type PlanSpec = ReturnType<typeof getPlanSpec>
