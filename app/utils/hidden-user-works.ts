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
