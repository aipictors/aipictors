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
 * 一覧(新着一覧と同じ) / カード(タイムライン) を切り替え、画面更新後も状態を維持します。
 */
export function useFollowTimelineView(): [
  boolean,
  (isTimeline: boolean) => void,
] {
  return usePersistentState<boolean>(
    "follow-timeline-view",
    false, // デフォルトは一覧表示
    "localStorage",
  )
}
