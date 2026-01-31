import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * 作品のスタイルの文言を返す
 * @param
 */
export const toStyleText: (
  style: IntrospectionEnum<"ImageStyle">,
) => string | undefined = (
  style: IntrospectionEnum<"ImageStyle">,
): string | undefined => {
  const t = useTranslation()

  switch (style) {
    case "ILLUSTRATION":
      return t("イラスト", "Illustration")
    case "REAL":
      return t("リアル", "Real")
    case "SEMI_REAL":
      return t("セミリアル", "SemiReal")
  }
}
