import type { PassType } from "@/graphql/__generated__/graphql"

export const toPassName = (passType: PassType) => {
  if (passType === "LITE") {
    return "ライトプラン"
  }

  if (passType === "STANDARD") {
    return "スタンダードプラン"
  }

  if (passType === "PREMIUM") {
    return "プレミアムプラン"
  }

  return "-"
}
