export const STICKERS_PER_PAGE = 42

export const STICKER_SORTS = {
  new: { ja: "新着", en: "New", where: {} },
  old: {
    ja: "古い順",
    en: "Oldest",
    where: { orderBy: "DATE_CREATED", sort: "ASC" },
  },
  popular: {
    ja: "人気",
    en: "Popular",
    where: { orderBy: "DATE_DOWNLOADED", sort: "DESC" },
  },
  used: {
    ja: "よく使われる",
    en: "Most used",
    where: { orderBy: "DATE_USED", sort: "DESC" },
  },
} as const

export type StickerSort = keyof typeof STICKER_SORTS

const toStickerSort = (value: string | null): StickerSort => {
  return value !== null && value in STICKER_SORTS
    ? (value as StickerSort)
    : "new"
}

/**
 * 公開スタンプ一覧の並び順とページを URL から読む
 */
export const readStickerListParams = (request: Request) => {
  const params = new URL(request.url).searchParams
  const page = Number.parseInt(params.get("page") ?? "0")

  return {
    sort: toStickerSort(params.get("sort")),
    page: Number.isNaN(page) || page < 0 ? 0 : page,
  }
}
