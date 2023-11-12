import { PassType } from "@/__generated__/apollo"

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
