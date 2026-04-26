const RECENT_STICKER_STORAGE_KEY = "aipictors:recent-sticker-ids"
const MAX_RECENT_STICKERS = 24

const canUseStorage = () => typeof window !== "undefined"

export const readRecentStickerIds = (): string[] => {
  if (!canUseStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(RECENT_STICKER_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((value): value is string => typeof value === "string")
  } catch {
    return []
  }
}

export const writeRecentStickerIds = (stickerIds: string[]) => {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(
    RECENT_STICKER_STORAGE_KEY,
    JSON.stringify(stickerIds.slice(0, MAX_RECENT_STICKERS)),
  )
}

export const recordRecentStickerId = (stickerId: string) => {
  const nextStickerIds = [
    stickerId,
    ...readRecentStickerIds().filter((id) => id !== stickerId),
  ].slice(0, MAX_RECENT_STICKERS)

  writeRecentStickerIds(nextStickerIds)

  return nextStickerIds
}

export const sortStickersByRecent = <T extends { id: string }>(
  stickers: T[],
  recentStickerIds: string[],
) => {
  if (recentStickerIds.length === 0) {
    return stickers
  }

  const rankMap = new Map(recentStickerIds.map((id, index) => [id, index]))

  return [...stickers].sort((left, right) => {
    const leftRank = rankMap.get(left.id)
    const rightRank = rankMap.get(right.id)

    if (leftRank === undefined && rightRank === undefined) {
      return 0
    }

    if (leftRank === undefined) {
      return 1
    }

    if (rightRank === undefined) {
      return -1
    }

    return leftRank - rightRank
  })
}