import type { PanelItem } from "~/routes/($lang)._main._index/components/home-notifications-panel-items"

export type LikedUserEntry = Pick<PanelItem, "id" | "createdAt" | "user"> &
  Partial<Pick<PanelItem, "likeCount">>

/**
 * まとめたいいねの通知から、いいねした人の一覧を作る（新しい順）。
 * 同じ人が付け直したときは新しいほうだけ残す。匿名のいいねは 1 件ずつ出す
 * （数件が 1 件の通知にまとまっている匿名いいねは、likeCount の数だけ出す）
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
    .flatMap((item) => {
      const count = item.user ? 1 : Math.max(1, item.likeCount ?? 1)
      return Array.from({ length: count }, (_, index) => ({
        id: index === 0 ? item.id : `${item.id}:${index}`,
        createdAt: item.createdAt,
        user: item.user,
      }))
    })
}
