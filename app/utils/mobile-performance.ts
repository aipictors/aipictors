/**
 * モバイルパフォーマンス最適化のためのユーティリティ
 * バンドルサイズとレンダリングパフォーマンスを改善する
 */

// デバウンス関数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
