import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import {
  useFixedSeedImagesPerRequestPreference,
  useImagesPerRequestPreference,
} from "~/routes/($lang).generation._index/hooks/use-images-per-request"
import {
  getMaxImagesPerRequest,
  resolveImagesPerRequest,
} from "~/routes/($lang).generation._index/utils/get-max-images-per-request"
import { isLiteDayTrialActive } from "~/routes/($lang).generation._index/utils/lite-day-trial"

/**
 * いまの設定で 1 回に作れる枚数の上限と、実際に作る枚数
 */
export function useImagesPerRequest() {
  const context = useGenerationContext()

  const [normalPreference, setNormalPreference] =
    useImagesPerRequestPreference()

  const [fixedSeedPreference, setFixedSeedPreference] =
    useFixedSeedImagesPerRequestPreference()

  // Seed を指定しているときは別に覚えた枚数（既定 1 枚）を使う
  const isSeedFixed = context.config.seed !== -1

  const preference = isSeedFixed ? fixedSeedPreference : normalPreference

  const setPreference = isSeedFixed
    ? setFixedSeedPreference
    : setNormalPreference

  const passType = context.currentPass?.type
  const isPaidPlan =
    passType === "LITE" || passType === "STANDARD" || passType === "PREMIUM"

  // ライト1日体験中は、その日だけライトと同じく 1 回 4 枚まで（画像から生成はプランの人だけ）
  const isLiteDayTrial = isLiteDayTrialActive(
    context.liteDayTrial,
    context.currentPass !== null,
  )
  const canBatch = isPaidPlan || isLiteDayTrial

  const selectedModel = context.imageModels.find((model) => {
    return model.id === context.config.modelId
  })

  const generationType =
    context.config.i2iImageBase64 &&
    (isPaidPlan || context.config.modelType === "GEMINI")
      ? "IMAGE_TO_IMAGE"
      : "TEXT_TO_IMAGE"

  const max = getMaxImagesPerRequest({
    modelKey:
      selectedModel?.name ?? selectedModel?.id ?? context.config.modelId ?? "",
    modelType: context.config.modelType,
    generationType,
    upscaleSize: context.config.upscaleSize,
    hasControlNet: context.config.controlNetImageBase64 !== null,
    isPaidPlan: canBatch,
    sizeType: context.config.sizeType,
  })

  return {
    /** プランでの上限（無料 2・ライト以上 4） */
    planMax: canBatch ? 4 : 2,
    max,
    count: resolveImagesPerRequest(preference, max),
    /** Seed を指定しているか（指定中は別に覚えた枚数を使う） */
    isSeedFixed,
    /** Seed の指定を切り替えたときに使う枚数（指定中ならランダムに戻したときの枚数） */
    otherCount: resolveImagesPerRequest(
      isSeedFixed ? normalPreference : fixedSeedPreference,
      max,
    ),
    preference,
    setPreference,
    isPaidPlan,
    /** ライト1日体験中 */
    isLiteDayTrial,
  }
}
