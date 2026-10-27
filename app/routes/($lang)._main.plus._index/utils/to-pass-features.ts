import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { getPlanSpec } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

/**
 * プランの画像生成の特典
 */
export function toPassFeatures(
  passType: IntrospectionEnum<"PassType"> | "FREE",
) {
  if (passType === "FREE") {
    const spec = getPlanSpec("FREE")
    return [
      `1回の生成で${spec.imagesPerRequest}枚`,
      `毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`,
      "みんなのモデルで生成",
      `LoRA ${spec.loraModels}個まで`,
      `モデル登録 ${spec.modelSlots}個まで`,
    ]
  }

  if (passType === "LITE") {
    const spec = getPlanSpec("LITE")
    return [
      `1回の生成で${spec.imagesPerRequest}枚`,
      `毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`,
      "画像から生成（img2img・部分修正）",
      "Gemini Nano Banana",
      `LoRA ${spec.loraModels}個まで`,
      `お気に入り履歴 ${spec.favoriteHistories}件`,
      `モデル登録 ${spec.modelSlots}個まで`,
    ]
  }

  if (passType === "STANDARD" || passType === "PREMIUM") {
    const spec = getPlanSpec(passType)
    return [
      `1回の生成で${spec.imagesPerRequest}枚`,
      `毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`,
      `同時に${spec.concurrentTasks}件まで生成`,
      "高速生成モード⚡️",
      "予約生成機能",
      "画像から生成（img2img・部分修正）",
      "Gemini Nano Banana / Nano Banana 2",
      `LoRA ${spec.loraModels}個まで`,
      `お気に入り履歴 ${spec.favoriteHistories}件`,
      `モデル登録 ${spec.modelSlots}個まで`,
    ]
  }

  return []
}
