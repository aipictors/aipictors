import type { PanelItem } from "~/routes/($lang)._main._index/components/home-notifications-panel-items"

export type LikedUserEntry = Pick<PanelItem, "id" | "createdAt" | "user">

/**
 * まとめたいいねの通知から、いいねした人の一覧を作る（新しい順）。
 * 同じ人が付け直したときは新しいほうだけ残す。匿名のいいねは 1 件ずつ出す
 */
export function toLikedUserEntries(
  group: readonly LikedUserEntry[],
): LikedUserEntry[] {
  const seen = new Set<string>()
  return [...group]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((item) => {
      if (!item.user) return true
      if (seen.has(item.user.id)) return false
      seen.add(item.user.id)
      return true
    })
    .map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      user: item.user,
    }))
}
