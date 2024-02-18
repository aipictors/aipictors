/**
 * 時間フォーマットに変換
 */
export function toGenerationTime(seconds: number) {
  if (seconds < 60) return `${seconds}s` // 秒
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m` // 分
  return `${Math.floor(seconds / 3600)}h` // 時間
}
