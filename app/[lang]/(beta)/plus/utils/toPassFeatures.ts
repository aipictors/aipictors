import { PassType } from "__generated__/apollo"
import { Config } from "config"

export const toPassFeatures = (passType: PassType) => {
  if (passType === "LITE") {
    return [`1日に${Config.passFeature.imageGenerationsCount.lite}枚の画像生成`]
  }

  if (passType === "STANDARD") {
    return [
      `1日に${Config.passFeature.imageGenerationsCount.standard}枚の画像生成`,
      "高速モードでの画像生成",
      `同時に${Config.passFeature.imageGenerationTasksCount.standard}枚の画像生成`,
      `${Config.passFeature.imageGenerationLoraModelsCount.standard}つのLoRAモデルによる画像生成`,
      `${Config.passFeature.imageGenerationHistoriesCount.standard}件の画像生成のお気に入り履歴`,
    ]
  }

  if (passType === "PREMIUM") {
    return [
      `1日に${Config.passFeature.imageGenerationsCount.premium}枚の画像生成`,
      "高速モードでの画像生成",
      `同時に${Config.passFeature.imageGenerationTasksCount.premium}枚の画像生成`,
      `${Config.passFeature.imageGenerationLoraModelsCount.premium}つのLoRAモデルによる画像生成`,
      `${Config.passFeature.imageGenerationHistoriesCount.premium}件の画像生成のお気に入り履歴`,
    ]
  }

  return []
}
