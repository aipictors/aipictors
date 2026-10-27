import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useImagesPerRequestPreference } from "~/routes/($lang).generation._index/hooks/use-images-per-request"
import {
  getMaxImagesPerRequest,
  resolveImagesPerRequest,
} from "~/routes/($lang).generation._index/utils/get-max-images-per-request"

/**
 * いまの設定で 1 回に作れる枚数の上限と、実際に作る枚数
 */
export function useImagesPerRequest() {
  const context = useGenerationContext()

  const [preference, setPreference] = useImagesPerRequestPreference()

  const passType = context.currentPass?.type
  const isPaidPlan =
    passType === "LITE" || passType === "STANDARD" || passType === "PREMIUM"

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
    isPaidPlan,
  })

  return {
    /** プランでの上限（無料 2・ライト以上 4） */
    planMax: isPaidPlan ? 4 : 2,
    max,
    count: resolveImagesPerRequest(preference, max),
    preference,
    setPreference,
    isPaidPlan,
  }
}
