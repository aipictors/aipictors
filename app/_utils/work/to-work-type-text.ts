import type { IntrospectionEnum } from "@/_lib/introspection-enum"

/**
 * 作品の種別の文言を返す
 * @param
 */
export const toWorkTypeText = (type: IntrospectionEnum<"WorkType">) => {
  switch (type) {
    case "WORK":
      return "画像"
    case "VIDEO":
      return "動画"
    case "COLUMN":
      return "コラム"
    case "NOVEL":
      return "小説"
    default:
      return "画像"
  }
}
