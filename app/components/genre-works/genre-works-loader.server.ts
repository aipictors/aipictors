import { graphql, type ResultOf, type VariablesOf } from "gql.tada"
import {
  GenreNewWorkFragment,
  GenreWorkCardFragment,
} from "~/components/genre-works/genre-work-card"
import {
  GENRE_CONFIGS,
  type GenreKey,
} from "~/components/genre-works/genre-works-config"
import { pickTrendingTags } from "~/components/genre-works/pick-trending-tags"
import { loaderClient } from "~/lib/loader-client"

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 日単位に丸めた N 日前（ISO 8601）
 * 秒まで渡すとキャッシュのたびに条件が変わるので、1 日の間は同じ値にする
 */
const toDaysAgoIso = (days: number) =>
  new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS - days * DAY_MS,
  ).toISOString()

type WorksWhere = VariablesOf<typeof GenreWorksQuery>["week"]

/** 全年齢で公開中の画像作品（入口に大きく出すものはこの条件にする） */
const baseWhere = (style: WorksWhere["style"]): WorksWhere => ({
  style,
  ratings: ["G"],
  isSensitive: false,
  isNowCreatedAt: true,
  workType: "WORK",
})

const RANKING_COUNT = 10
const HERO_COUNT = 5
const CLASSICS_COUNT = 10
/** サーバーで描く新着の数（HTML が大きくなりすぎないように、続きは「もっと見る」で読む） */
const GENRE_NEW_WORKS_COUNT = 24

type CardWork = ResultOf<typeof GenreWorksQuery>["weekWorks"][number]

/**
 * ジャンルの入口のデータ
 * - 乱数は使わない（キャッシュする HTML の内容が読み直すたびに変わらないように）
 * - 同じ作品が別の枠に重ねて出ないよう、ランキング→ヒーロー→定番の順に取り除く
 */
export async function loadGenreWorks(key: GenreKey) {
  const genre = GENRE_CONFIGS[key]
  const base = baseWhere(genre.style)
  const liked: WorksWhere = {
    ...base,
    orderBy: "LIKES_COUNT",
    isOneWorkPerUser: true,
  }

  const toCoverWhere = (style: WorksWhere["style"]): WorksWhere => ({
    ...baseWhere(style),
    orderBy: "LIKES_COUNT",
    createdAtAfter: toDaysAgoIso(30),
  })

  const toTasteWhere = (index: number): WorksWhere => ({
    ...base,
    orderBy: "LIKES_COUNT",
    tagNames: [genre.tastes[index]?.tag ?? ""],
  })

  const result = await loaderClient.query({
    query: GenreWorksQuery,
    variables: {
      week: { ...liked, createdAtAfter: toDaysAgoIso(7) },
      month: { ...liked, createdAtAfter: toDaysAgoIso(30) },
      classics: liked,
      newWorks: {
        style: genre.style,
        ratings: ["G"],
        isSensitive: false,
        isNowCreatedAt: true,
        orderBy: "DATE_CREATED",
        // 連続で投稿する人の作品だけで埋まらないようにする
        isOneWorkPerUser: true,
      },
      newWorksLimit: GENRE_NEW_WORKS_COUNT,
      taste0: toTasteWhere(0),
      taste1: toTasteWhere(1),
      taste2: toTasteWhere(2),
      taste3: toTasteWhere(3),
      taste4: toTasteWhere(4),
      taste5: toTasteWhere(5),
      taste6: toTasteWhere(6),
      taste7: toTasteWhere(7),
      cover2d: toCoverWhere(GENRE_CONFIGS["2d"].style),
      cover25d: toCoverWhere(GENRE_CONFIGS["2.5d"].style),
      cover3d: toCoverWhere(GENRE_CONFIGS["3d"].style),
    },
  })

  const data = result.data

  const usedIds = new Set<string>()
  const takeUnused = (works: readonly CardWork[], count: number) => {
    const picked: Omit<CardWork, "tagNames">[] = []
    for (const work of works) {
      if (picked.length >= count) break
      if (usedIds.has(work.id)) continue
      usedIds.add(work.id)
      // タグはランキングの集計にだけ使う（画面には渡さない）
      const { tagNames: _tagNames, ...card } = work
      picked.push(card)
    }
    return picked
  }

  const rankingWorks = takeUnused(data.weekWorks, RANKING_COUNT)
  const heroWorks = takeUnused(
    [...data.monthWorks, ...data.classicWorks],
    HERO_COUNT,
  )
  const classicWorks = takeUnused(data.classicWorks, CLASSICS_COUNT)

  const tasteWorks = [
    data.taste0,
    data.taste1,
    data.taste2,
    data.taste3,
    data.taste4,
    data.taste5,
    data.taste6,
    data.taste7,
  ]

  // 同じ作品に複数のタグが付いていることが多いので、カードごとに別の作品の画像にする
  const usedTasteIds = new Set<string>()
  const tastes = genre.tastes.map((taste, index) => {
    const work = tasteWorks[index]?.find((item) => !usedTasteIds.has(item.id))
    if (work) {
      usedTasteIds.add(work.id)
    }
    return { tag: taste.tag, imageUrl: work?.smallThumbnailImageURL ?? null }
  })

  return {
    heroWorks,
    rankingWorks,
    classicWorks,
    newWorks: data.newWorks,
    tastes,
    trendingTags: pickTrendingTags(data.weekWorks, {
      limit: 12,
      excludes: genre.tastes.map((taste) => taste.tag),
    }),
    covers: {
      "2d": data.cover2d[0]?.smallThumbnailImageURL ?? null,
      "2.5d": data.cover25d[0]?.smallThumbnailImageURL ?? null,
      "3d": data.cover3d[0]?.smallThumbnailImageURL ?? null,
    } satisfies Record<GenreKey, string | null>,
  }
}

export type GenreWorksData = Awaited<ReturnType<typeof loadGenreWorks>>

const GenreWorksQuery = graphql(
  `query GenreWorks(
    $week: WorksWhereInput!
    $month: WorksWhereInput!
    $classics: WorksWhereInput!
    $newWorks: WorksWhereInput!
    $newWorksLimit: Int!
    $taste0: WorksWhereInput!
    $taste1: WorksWhereInput!
    $taste2: WorksWhereInput!
    $taste3: WorksWhereInput!
    $taste4: WorksWhereInput!
    $taste5: WorksWhereInput!
    $taste6: WorksWhereInput!
    $taste7: WorksWhereInput!
    $cover2d: WorksWhereInput!
    $cover25d: WorksWhereInput!
    $cover3d: WorksWhereInput!
  ) {
    weekWorks: works(offset: 0, limit: 40, where: $week) {
      ...GenreWorkCard
      tagNames
    }
    monthWorks: works(offset: 0, limit: 24, where: $month) {
      ...GenreWorkCard
      tagNames
    }
    classicWorks: works(offset: 0, limit: 32, where: $classics) {
      ...GenreWorkCard
      tagNames
    }
    newWorks: works(offset: 0, limit: $newWorksLimit, where: $newWorks) {
      ...GenreNewWork
    }
    taste0: works(offset: 0, limit: 8, where: $taste0) { id smallThumbnailImageURL }
    taste1: works(offset: 0, limit: 8, where: $taste1) { id smallThumbnailImageURL }
    taste2: works(offset: 0, limit: 8, where: $taste2) { id smallThumbnailImageURL }
    taste3: works(offset: 0, limit: 8, where: $taste3) { id smallThumbnailImageURL }
    taste4: works(offset: 0, limit: 8, where: $taste4) { id smallThumbnailImageURL }
    taste5: works(offset: 0, limit: 8, where: $taste5) { id smallThumbnailImageURL }
    taste6: works(offset: 0, limit: 8, where: $taste6) { id smallThumbnailImageURL }
    taste7: works(offset: 0, limit: 8, where: $taste7) { id smallThumbnailImageURL }
    cover2d: works(offset: 0, limit: 1, where: $cover2d) { id smallThumbnailImageURL }
    cover25d: works(offset: 0, limit: 1, where: $cover25d) { id smallThumbnailImageURL }
    cover3d: works(offset: 0, limit: 1, where: $cover3d) { id smallThumbnailImageURL }
  }`,
  [GenreWorkCardFragment, GenreNewWorkFragment],
)
