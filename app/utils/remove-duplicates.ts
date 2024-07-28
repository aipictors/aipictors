/**
 * 重複を削除する
 * @param nodes
 */
export function removeDuplicates<T>(nodes: T[]) {
  return Array.from(new Set(nodes)).flatMap((node) => node ?? [])
}
