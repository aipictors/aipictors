import type { TSortableItem } from "~/components/drag/sortable-item"

const sortableKeys = new WeakMap<TSortableItem, string>()
let nextSortableKey = 0

/**
 * 並べ替えても変わらない画像ごとの目印
 * id は並び順に振り直すので、id を目印にすると離した瞬間に別の画像として描き直され、
 * 戻りのアニメーションが元の場所へ飛んだり全体が跳ねたりする
 */
export const toSortableKey = (
  item: TSortableItem,
  /** まだ目印のない画像に使う目印（画像を直して作り直されたとき、前の目印を引き継ぐ） */
  fallbackKey?: string,
): string => {
  if (item.sortKey) return item.sortKey
  let key = sortableKeys.get(item)
  if (key === undefined) {
    if (fallbackKey === undefined) {
      nextSortableKey += 1
      key = `sortable-${nextSortableKey}`
    } else {
      key = fallbackKey
    }
    sortableKeys.set(item, key)
  }
  return key
}

/** 並びに合わせて id を振り直す（目印は持ち越す） */
export const renumberSortableItems = (
  items: TSortableItem[],
): TSortableItem[] =>
  items.map((item, index) => ({
    ...item,
    id: index,
    sortKey: toSortableKey(item),
  }))
