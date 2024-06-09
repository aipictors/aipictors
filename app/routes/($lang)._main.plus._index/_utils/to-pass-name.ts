import type { IntrospectionEnum } from "@/_lib/introspection-enum"

export const toPassName = (passType: IntrospectionEnum<"PassType">) => {
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
