import type { TranslationFn } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

/**
 * プランの画像生成の特典
 */
export function toPassFeatures(
  passType: IntrospectionEnum<"PassType"> | "FREE",
  t: TranslationFn,
) {
  if (passType === "FREE") {
    const spec = getPlanSpec("FREE")
    return [
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest} images per generation`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins daily (up to ${spec.dailyImages} images a day)`),
      t("みんなのモデルで生成", "Generate with community models"),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRA`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Up to ${spec.modelSlots} model uploads`),
    ]
  }

  if (passType === "LITE") {
    const spec = getPlanSpec("LITE")
    return [
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest} images per generation`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins daily (up to ${spec.dailyImages} images a day)`),
      t("画像から生成（img2img・部分修正）", "Generate from images (img2img, inpainting)"),
      t(`Gemini Nano Banana（フリーコインで週${spec.geminiWeeklyImages}枚まで）`, `Gemini Nano Banana (up to ${spec.geminiWeeklyImages} images a week with free coins)`),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRA`),
      t(`お気に入り履歴 ${spec.favoriteHistories}件`, `${spec.favoriteHistories} favorite history items`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Up to ${spec.modelSlots} model uploads`),
    ]
  }

  if (passType === "STANDARD" || passType === "PREMIUM") {
    const spec = getPlanSpec(passType)
    return [
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest} images per generation`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins daily (up to ${spec.dailyImages} images a day)`),
      t(`同時に${spec.concurrentTasks}件まで生成`, `Up to ${spec.concurrentTasks} generations at once`),
      t("高速生成モード⚡️", "Fast generation mode⚡️"),
      t("予約生成機能", "Scheduled generation"),
      t("画像から生成（img2img・部分修正）", "Generate from images (img2img, inpainting)"),
      t(`Gemini Nano Banana / Nano Banana 2（フリーコインで週${spec.geminiWeeklyImages}枚まで）`, `Gemini Nano Banana / Nano Banana 2 (up to ${spec.geminiWeeklyImages} images a week with free coins)`),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRA`),
      t(`お気に入り履歴 ${spec.favoriteHistories}件`, `${spec.favoriteHistories} favorite history items`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Up to ${spec.modelSlots} model uploads`),
    ]
  }

  return []
}
