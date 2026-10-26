import { format } from "date-fns"

type Item = {
  /**
   * 生成日時（UNIX秒）。不明な場合はnull
   */
  completedAt: number | null
  extension: string
}

/**
 * 生成画像のZip内ファイル名を作成する
 * 生成日時の古い順に並べ、「生成日時_連番.拡張子」の形式にする（例: 20261027-031522_001.png）
 * 展開したときにファイル名順で生成順に並ぶようにするため
 * @param items 選択された画像（選択順）
 * @returns itemsと同じ順序のファイル名
 */
export function toGenerationImageFileNames(
  items: Item[],
  formatDate: (date: Date) => string = (date) =>
    format(date, "yyyyMMdd-HHmmss"),
): string[] {
  const order = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aTime = a.item.completedAt
      const bTime = b.item.completedAt
      if (aTime === bTime) return a.index - b.index
      // 生成日時が不明なものは末尾に置く
      if (aTime === null) return 1
      if (bTime === null) return -1
      return aTime - bTime
    })

  const digits = Math.max(3, String(items.length).length)

  const names: string[] = new Array(items.length)

  order.forEach(({ item, index }, position) => {
    const sequence = String(position + 1).padStart(digits, "0")
    const date =
      item.completedAt === null
        ? "unknown"
        : formatDate(new Date(item.completedAt * 1000))
    names[index] = `${date}_${sequence}.${item.extension}`
  })

  return names
}

/**
 * data属性の値から生成日時（UNIX秒）を取得する
 * @param value
 */
export function parseCompletedAt(value: string | undefined): number | null {
  if (value === undefined || value === "") return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  // ミリ秒で渡された場合は秒に変換する
  return parsed > 1e12 ? Math.floor(parsed / 1000) : parsed
}
