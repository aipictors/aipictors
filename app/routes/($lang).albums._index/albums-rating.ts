import type { IntrospectionEnum } from "~/lib/introspection-enum"

/**
 * 全年齢のメニューから開くページなので、指定がなければ全年齢（G）だけにする
 * すべての年齢制限は rating=ALL で開く（null を返す）
 */
export const toAlbumsRating = (
  value: string | null,
): IntrospectionEnum<"AlbumRating"> | null => {
  if (value === "ALL") {
    return null
  }

  if (value === "R15" || value === "R18" || value === "R18G") {
    return value
  }

  return "G"
}
