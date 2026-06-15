import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { config } from "~/config"

export function toPassFeatures(passType: IntrospectionEnum<"PassType">) {
  if (passType === "LITE") {
    return [
      "初回アクセス時に500フリーコイン付与",
      "通常生成 10コイン / 枚",
      "Gemini Nano Banana 50コイン / 枚",
      "画像から生成機能",
    ]
  }

  if (passType === "STANDARD") {
    return [
      "初回アクセス時に1000フリーコイン付与",
      "通常生成 10コイン / 枚",
      "Gemini Nano Banana 50コイン / 枚",
      "Gemini Nano Banana 2 100コイン / 枚",
      `同時に${config.passFeature.imageGenerationTasksCount.standard}枚の生成`,
      `${config.passFeature.imageGenerationLoraModelsCount.standard}つのLoRAモデル`,
      `${config.passFeature.imageGenerationHistoriesCount.standard}件のお気に入り履歴`,
      "高速生成モード⚡️",
      "予約生成機能",
      "画像から生成機能",
    ]
  }

  if (passType === "PREMIUM") {
    return [
      "初回アクセス時に2000フリーコイン付与",
      "通常生成 10コイン / 枚",
      "Gemini Nano Banana 50コイン / 枚",
      "Gemini Nano Banana 2 100コイン / 枚",
      `同時に${config.passFeature.imageGenerationTasksCount.premium}枚の生成`,
      `${config.passFeature.imageGenerationLoraModelsCount.premium}つのLoRAモデル`,
      `${config.passFeature.imageGenerationHistoriesCount.premium}件のお気に入り履歴`,
      "高速生成モード⚡️",
      "予約生成機能",
      "画像から生成機能",
    ]
  }

  return []
}
