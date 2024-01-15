import { Config } from "@/config"
import { PassType } from "@/graphql/__generated__/graphql"

export const toPassFeatures = (passType: PassType) => {
  if (passType === "LITE") {
    return [
      `1日に${Config.passFeature.imageGenerationsCount.lite}枚の生成`,
      "画像から生成機能",
    ]
  }

  if (passType === "STANDARD") {
    return [
      `1日に${Config.passFeature.imageGenerationsCount.standard}枚の生成`,
      `同時に${Config.passFeature.imageGenerationTasksCount.standard}枚の生成`,
      `${Config.passFeature.imageGenerationLoraModelsCount.standard}つのLoRAモデル`,
      `${Config.passFeature.imageGenerationHistoriesCount.standard}件のお気に入り履歴`,
      "高速生成モード⚡️",
      "予約生成機能",
      "画像から生成機能",
    ]
  }

  if (passType === "PREMIUM") {
    return [
      `1日に${Config.passFeature.imageGenerationsCount.premium}枚の生成`,
      `同時に${Config.passFeature.imageGenerationTasksCount.premium}枚の生成`,
      `${Config.passFeature.imageGenerationLoraModelsCount.premium}つのLoRAモデル`,
      `${Config.passFeature.imageGenerationHistoriesCount.premium}件のお気に入り履歴`,
      "高速生成モード⚡️",
      "予約生成機能",
      "画像から生成機能",
    ]
  }

  return []
}
