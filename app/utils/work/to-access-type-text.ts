import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * 作品の公開状態の文言を返す
 * @param
 */
export const toAccessTypeText = (type: IntrospectionEnum<"AccessType">) => {
  const t = useTranslation()

  switch (type) {
    case "PUBLIC":
      return t("公開", "Public")
    case "SILENT":
      return t("公開(新着無)", "Public (No New Listing)")
    case "PRIVATE":
      return t("非公開", "Private")
    case "LIMITED":
      return t("限定公開", "Limited")
    case "DRAFT":
      return t("下書き", "Draft")
  }
}
