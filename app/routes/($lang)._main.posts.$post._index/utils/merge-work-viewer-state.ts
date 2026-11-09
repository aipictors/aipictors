type ViewerState = {
  isLiked: boolean
  isBookmarked: boolean
  isMyRecommended: boolean
  user?: Record<string, unknown> | null
}

/**
 * ローダーの作品（ログインしていない人向け）に、閲覧者ごとの状態だけを重ねる
 */
export const mergeWorkViewerState = <T>(
  work: T,
  viewerState: ViewerState | null | undefined,
): T => {
  if (!work || !viewerState) return work
  const base = work as { user?: Record<string, unknown> | null }
  return {
    ...base,
    isLiked: viewerState.isLiked,
    isBookmarked: viewerState.isBookmarked,
    isMyRecommended: viewerState.isMyRecommended,
    user:
      base.user && viewerState.user
        ? { ...base.user, ...viewerState.user }
        : base.user,
  } as T
}
