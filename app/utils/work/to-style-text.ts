import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * 作品のスタイルの文言を返す
 * @param
 */
export const toStyleText = (style: IntrospectionEnum<"ImageStyle">) => {
  switch (style) {
    case "ILLUSTRATION":
      return "イラスト"
    case "REAL":
      return "リアル"
    case "SEMI_REAL":
      return "セミリアル"
  }
}
