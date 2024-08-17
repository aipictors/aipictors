import type { IntrospectionEnum } from "~/lib/introspection-enum"

export function toPassName(passType: IntrospectionEnum<"PassType">) {
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
