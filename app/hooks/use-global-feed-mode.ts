import { usePersistentState } from "~/hooks/use-persistent-state"

/**
 * グローバルなタイムラインビューの状態管理
 * 全画面で共有され、画面更新後も状態が維持される
 */
export function useGlobalTimelineView(): [
  boolean,
  (isTimeline: boolean) => void,
] {
  return usePersistentState<boolean>(
    "global-timeline-view",
    false, // デフォルトはグリッドビュー
    "localStorage",
  )
}

/**
 * フォロー系フィード（フォロー新着 / お気に入りタグ新着）の表示モード
 * カード（タイムライン）表示は廃止したので、常に一覧（新着一覧と同じ）
 */
export function useFollowTimelineView(): [
  boolean,
  (isTimeline: boolean) => void,
] {
  return [false, () => {}]
}
