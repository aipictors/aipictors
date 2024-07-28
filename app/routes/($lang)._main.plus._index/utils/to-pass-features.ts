import type { IntrospectionEnum } from "@/lib/introspection-enum"
import { config } from "@/config"

export const toPassFeatures = (passType: IntrospectionEnum<"PassType">) => {
  if (passType === "LITE") {
    return [
      `1日に${config.passFeature.imageGenerationsCount.lite}枚の生成`,
      "画像から生成機能",
    ]
  }

  if (passType === "STANDARD") {
    return [
      `1日に${config.passFeature.imageGenerationsCount.standard}枚の生成`,
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
      `1日に${config.passFeature.imageGenerationsCount.premium}枚の生成`,
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
