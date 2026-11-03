const standardImageGenerationCoinCost = 10
const imageEditGenerationCoinCost = 50
const geminiNanoBananaCoinCost = 50
const geminiNanoBanana2CoinCost = 100
const fluxSchnellCoinCost = 30
const fluxProCoinCost = 50

export type CoinSummaryResponse = {
  error: string | null
  data: {
    freeBalance: number
    premiumBalance: number
    totalBalance: number
    granted: boolean
    grantedFreeCoins: number
    grantedPremiumCoins: number
  } | null
}

export const normalizeCoinSummary = (
  summary: CoinSummaryResponse["data"],
): CoinSummaryResponse["data"] => {
  if (summary === null) {
    return null
  }

  const freeBalance = Math.max(0, summary.freeBalance ?? 0)
  const premiumBalance = Math.max(0, summary.premiumBalance ?? 0)

  return {
    ...summary,
    freeBalance,
    premiumBalance,
    totalBalance: Math.max(0, freeBalance + premiumBalance),
  }
}

/**
 * モデルごとの 1 枚のコイン（高解像度は 2 倍）
 */
export const calcGenerationModelCoinCost = (props: {
  modelKey: string
  modelType: string | null
  generationType: "IMAGE_TO_IMAGE" | "TEXT_TO_IMAGE"
  upscaleSize: number | null
}) => {
  const normalizedModelKey = props.modelKey.toLowerCase()

  if (normalizedModelKey === "flux.1 pro") {
    return fluxProCoinCost
  }

  if (normalizedModelKey === "flux.1 schnell") {
    return fluxSchnellCoinCost
  }

  const isGeminiModel =
    props.modelType === "GEMINI" ||
    normalizedModelKey.includes("gemini")

  if (isGeminiModel) {
    const isGemini31 =
      normalizedModelKey === "gemini-3.1-flash-image-preview" ||
      normalizedModelKey.includes("gemini-3.1") ||
      normalizedModelKey.includes("gemininanobanana2")

    return isGemini31 ? geminiNanoBanana2CoinCost : geminiNanoBananaCoinCost
  }

  if (props.generationType === "IMAGE_TO_IMAGE") {
    return imageEditGenerationCoinCost
  }

  // 高解像度は 1 枚 2 倍（サーバーの lib/image-generation-coins.ts と同じ）
  const multiplier =
    props.upscaleSize !== null && props.upscaleSize > 1
      ? 2
      : 1

  return standardImageGenerationCoinCost * multiplier
}
