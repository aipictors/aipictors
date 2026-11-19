type ViewerState = {
  isLiked: boolean
  isBookmarked: boolean
  isMyRecommended: boolean
  /** ローダーの作品はページのキャッシュ（最大 1 時間ほど）から来るので、いいね数も今の数で上書きする */
  likesCount?: number
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
    ...(typeof viewerState.likesCount === "number" && {
      likesCount: viewerState.likesCount,
    }),
    user:
      base.user && viewerState.user
        ? { ...base.user, ...viewerState.user }
        : base.user,
  } as T
}
