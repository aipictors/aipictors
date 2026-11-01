/**
 * 過去の名作ページの期間と、紹介する作品の選び方
 */

export const ARCHIVE_SEASONS = ["spring", "summer", "autumn", "winter"] as const
export type ArchiveSeason = (typeof ARCHIVE_SEASONS)[number]

export type ArchivePeriod = {
  /** null は全期間（殿堂） */
  year: number | null
  /** null は季節を問わない */
  season: ArchiveSeason | null
}

export type ArchiveDateRange = { after: string | null; before: string }

/** サービス開始の年 */
export const ARCHIVE_FIRST_YEAR = 2022

/** 新作は他のページで見られるので、公開からこの日数がたった作品だけ紹介する */
const ARCHIVE_MIN_AGE_DAYS = 30

/** 同じ人の作品ばかりにならないように */
const MAX_WORKS_PER_USER = 2

/** 季節の始まりの月（1 始まり）。どれも 3 か月（冬は 12〜2 月で年をまたぐ） */
const SEASON_START_MONTH: Record<ArchiveSeason, number> = {
  spring: 3,
  summer: 6,
  autumn: 9,
  winter: 12,
}

const pad = (value: number) => String(value).padStart(2, "0")

const toDateText = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

export const toJstDateText = (now: Date) =>
  toDateText(new Date(now.getTime() + 9 * 60 * 60 * 1000))

/** 選べる年（新しい順） */
export function toArchiveYears(now: Date) {
  const lastYear = Number(toJstDateText(now).slice(0, 4))
  return Array.from(
    { length: lastYear - ARCHIVE_FIRST_YEAR + 1 },
    (_, index) => lastYear - index,
  )
}

/** URL の値を読む。おかしな値は無視する */
export function parseArchivePeriod(
  params: URLSearchParams,
  now: Date,
): ArchivePeriod {
  const year = Number(params.get("year"))
  const season = params.get("season")
  return {
    year: toArchiveYears(now).includes(year) ? year : null,
    season: ARCHIVE_SEASONS.includes(season as ArchiveSeason)
      ? (season as ArchiveSeason)
      : null,
  }
}

/** 検索する期間（年を選ばない季節は、各年の同じ季節を並べる） */
export function toArchiveDateRanges(
  period: ArchivePeriod,
  now: Date,
): ArchiveDateRange[] {
  const limit = toDateText(
    new Date(now.getTime() - ARCHIVE_MIN_AGE_DAYS * 24 * 60 * 60 * 1000),
  )
  const clamp = (after: string | null, before: string) => {
    const end = before < limit ? before : limit
    return after !== null && after >= end ? null : { after, before: end }
  }

  const season = period.season
  if (season === null) {
    const range =
      period.year === null
        ? clamp(null, limit)
        : clamp(`${period.year}-01-01`, `${period.year + 1}-01-01`)
    return range === null ? [] : [range]
  }

  const years = period.year === null ? toArchiveYears(now) : [period.year]
  const startMonth = SEASON_START_MONTH[season]
  return years.flatMap((year) => {
    const endYear = startMonth === 12 ? year + 1 : year
    const endMonth = startMonth === 12 ? 3 : startMonth + 3
    const range = clamp(
      `${year}-${pad(startMonth)}-01`,
      `${endYear}-${pad(endMonth)}-01`,
    )
    return range === null ? [] : [range]
  })
}

/** 1 人 MAX_WORKS_PER_USER 作まで（渡した順に残す） */
export function limitWorksPerUser<T extends { user?: { id: string } | null }>(
  works: readonly T[],
) {
  const counts = new Map<string, number>()
  return works.filter((work) => {
    const userId = work.user?.id
    if (!userId) return true
    const count = counts.get(userId) ?? 0
    counts.set(userId, count + 1)
    return count < MAX_WORKS_PER_USER
  })
}

/** 文字列から決まる乱数（同じ日は誰が見ても同じ並び） */
const createRandom = (seedText: string) => {
  let seed = 2166136261
  for (const char of seedText) {
    seed = Math.imul(seed ^ (char.codePointAt(0) ?? 0), 16777619)
  }
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleWorks<T>(works: readonly T[], seedText: string) {
  const random = createRandom(seedText)
  const result = [...works]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    const current = result[index] as T
    result[index] = result[other] as T
    result[other] = current
  }
  return result
}
