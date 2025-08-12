import { usePersistentState } from "~/hooks/use-persistent-state"

export type FeedMode = "infinite" | "pagination"

/**
 * グローバルなフィード表示モード（無限スクロール/ページネーション）の状態管理
 * 全画面で共有され、画面更新後も状態が維持される
 */
export function useGlobalFeedMode(): [FeedMode, (mode: FeedMode) => void] {
  return usePersistentState<FeedMode>(
    "global-feed-mode",
    "infinite", // デフォルトは無限スクロール
    "localStorage",
  )
}

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
