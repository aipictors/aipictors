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
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest === 1 ? "1 image" : `${spec.imagesPerRequest} images`} per click`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins every day (${spec.dailyImages} images)`),
      t("みんなのモデルで生成", "All community models"),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRAs`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Upload up to ${spec.modelSlots} of your own models`),
    ]
  }

  if (passType === "LITE") {
    const spec = getPlanSpec("LITE")
    return [
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest === 1 ? "1 image" : `${spec.imagesPerRequest} images`} per click`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins every day (${spec.dailyImages} images)`),
      t("画像から生成（img2img・部分修正）", "Image-to-image and inpainting"),
      t(`Gemini Nano Banana（フリーコインで週${spec.geminiWeeklyImages}枚まで）`, `Gemini Nano Banana (${spec.geminiWeeklyImages} a week on free coins)`),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRAs`),
      t(`お気に入り履歴 ${spec.favoriteHistories}件`, `${spec.favoriteHistories} saved favorites in history`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Upload up to ${spec.modelSlots} of your own models`),
      t(`限定アイコン枠 ${spec.avatarFrames}種`, `${spec.avatarFrames} exclusive avatar frames`),
    ]
  }

  if (passType === "STANDARD" || passType === "PREMIUM") {
    const spec = getPlanSpec(passType)
    return [
      t(`1回の生成で${spec.imagesPerRequest}枚`, `${spec.imagesPerRequest === 1 ? "1 image" : `${spec.imagesPerRequest} images`} per click`),
      t(`毎日${spec.dailyFreeCoins}フリーコイン（1日${spec.dailyImages}枚まで）`, `${spec.dailyFreeCoins} free coins every day (${spec.dailyImages} images)`),
      t(`同時に${spec.concurrentTasks}件まで生成`, `${spec.concurrentTasks} generations running at once`),
      t("高速生成モード⚡️", "Fast mode ⚡️"),
      t("予約生成機能", "Scheduled generation"),
      t("画像から生成（img2img・部分修正）", "Image-to-image and inpainting"),
      t(`Gemini Nano Banana / Nano Banana 2（フリーコインで週${spec.geminiWeeklyImages}枚まで）`, `Gemini Nano Banana and Nano Banana 2 (${spec.geminiWeeklyImages} a week on free coins)`),
      t(`LoRA ${spec.loraModels}個まで`, `Up to ${spec.loraModels} LoRAs`),
      t(`お気に入り履歴 ${spec.favoriteHistories}件`, `${spec.favoriteHistories} saved favorites in history`),
      t(`モデル登録 ${spec.modelSlots}個まで`, `Upload up to ${spec.modelSlots} of your own models`),
      passType === "PREMIUM"
        ? t(`限定アイコン枠 ${spec.avatarFrames}種（プレミアムだけの王冠の枠 3種）`, `${spec.avatarFrames} exclusive avatar frames, with 3 crown frames only on Premium`)
        : t(`限定アイコン枠 ${spec.avatarFrames}種（金の枠 2種はスタンダードから）`, `${spec.avatarFrames} exclusive avatar frames, with 2 gold frames from Standard up`),
    ]
  }

  return []
}
