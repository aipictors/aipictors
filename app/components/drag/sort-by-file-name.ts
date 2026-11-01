import type { TSortableItem } from "~/components/drag/sortable-item"

/** 番号は数として比べる（2.png が 10.png より前） */
const compareFileNames = (a: string, b: string) =>
  a.localeCompare(b, "ja", { numeric: true, sensitivity: "base" })

const fileNameOrder = (a: TSortableItem, b: TSortableItem) => {
  if (a.fileName && b.fileName) return compareFileNames(a.fileName, b.fileName)
  // ファイル名のない画像（貼り付けなど）は後ろにまとめる
  if (a.fileName) return -1
  if (b.fileName) return 1
  return 0
}

/**
 * ファイル名順に並べ替える（id は並びに合わせて振り直す）
 */
export const sortByFileName = (items: TSortableItem[]): TSortableItem[] =>
  [...items].sort(fileNameOrder).map((item, index) => ({ ...item, id: index }))

export const isSortedByFileName = (items: TSortableItem[]) =>
  items.every(
    (item, index) => index === 0 || fileNameOrder(items[index - 1], item) <= 0,
  )
