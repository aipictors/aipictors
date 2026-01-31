import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * 作品の年齢制限の文言を返す
 * @param
 */
export const toRatingText: (
  type: IntrospectionEnum<"Rating">,
) => string | undefined = (
  type: IntrospectionEnum<"Rating">,
): string | undefined => {
  const t = useTranslation()

  switch (type) {
    case "G":
      return t("全年齢", "G")
    case "R15":
      return "軽度な性的、流血描写あり"
    case "R18":
      return "R18"
    case "R18G":
      return "R18G"
  }
}
