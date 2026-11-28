/**
 * 一覧から外す作者の id。API の作品一覧と同じく、ブロックした人はいつも、
 * ミュートした人は「ミュートしたユーザーの作品を表示する」をオフにしているときだけ外す
 */
export function toHiddenUserIds(props: {
  mutedUserIds: string[]
  blockedUserIds: string[]
  isShowingMutedUsersWorks: boolean | null
}): ReadonlySet<string> {
  return new Set([
    ...props.blockedUserIds,
    ...(props.isShowingMutedUsersWorks === false ? props.mutedUserIds : []),
  ])
}

/**
 * 外す作者の作品を一覧から除く（外す人がいなければ同じ配列を返す）
 */
export function filterWorksByHiddenUsers<T>(
  works: T[],
  hiddenUserIds: ReadonlySet<string>,
): T[] {
  if (hiddenUserIds.size === 0) return works
  return works.filter((work) => {
    const userId = (work as { user?: { id?: string | null } | null }).user?.id
    return !userId || !hiddenUserIds.has(userId)
  })
}
