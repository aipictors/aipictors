/**
 * フォロー新着の最初の画面を端末に覚えておく。
 * 次に開いたとき、ログイン確認と取得を待たずに前回の作品を先に出す
 */
const STORAGE_KEY = "aipictors:follow-feed-snapshot"

const MAX_ITEMS = 24

export type FollowFeedSnapshotItem = {
  id: string
  title: string
  thumbnailUrl: string
}

export type FollowFeedSnapshot = {
  userId: string
  isTimelineView: boolean
  items: FollowFeedSnapshotItem[]
}

export const readFollowFeedSnapshot = (): FollowFeedSnapshot | null => {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as FollowFeedSnapshot | null
  } catch {
    return null
  }
}

export const saveFollowFeedSnapshot = (snapshot: FollowFeedSnapshot) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...snapshot, items: snapshot.items.slice(0, MAX_ITEMS) }),
    )
  } catch {
    // 保存できなくても、読み込みを待つだけ
  }
}
