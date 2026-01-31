/**
 * 重複を削除する
 * @param nodes
 */
export function removeDuplicates<T>(nodes: Array<T | null | undefined>): T[] {
  return Array.from(new Set(nodes)).filter((node): node is T => node != null)
}
