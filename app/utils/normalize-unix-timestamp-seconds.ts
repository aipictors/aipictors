/**
 * API の日時（秒・ミリ秒・文字列）を Unix 秒にそろえる
 */
export const normalizeUnixTimestampSeconds = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.length === 0) return null

    if (/^\d+$/.test(trimmed)) {
      const parsed = Number(trimmed)
      if (!Number.isFinite(parsed)) return null
      return parsed > 1_000_000_000_000 ? Math.floor(parsed / 1000) : parsed
    }

    const parsedDate = new Date(trimmed)
    if (!Number.isNaN(parsedDate.getTime())) {
      return Math.floor(parsedDate.getTime() / 1000)
    }
  }

  return null
}
