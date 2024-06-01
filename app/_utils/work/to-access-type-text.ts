import type { AccessType } from "@/_graphql/__generated__/graphql"

/**
 * 作品の公開状態の文言を返す
 * @param
 */
export const toAccessTypeText = (type: AccessType) => {
  switch (type) {
    case "PUBLIC":
      return "公開"
    case "SILENT":
      return "公開(新着無)"
    case "PRIVATE":
      return "非公開"
    case "LIMITED":
      return "限定公開"
    case "DRAFT":
      return "下書き"
  }
}
