import { graphql, type ResultOf, type VariablesOf } from "gql.tada"
import {
  GenreNewWorkFragment,
  GenreWorkCardFragment,
} from "~/components/genre-works/genre-work-card"
import {
  type GenreConfig,
  type GenreKey,
  toGenreConfig,
} from "~/components/genre-works/genre-works-config"
import { pickTrendingTags } from "~/components/genre-works/pick-trending-tags"
import { loaderClient } from "~/lib/loader-client"
import {
  isFeaturableSensitiveTag,
  isFeaturableSensitiveWork,
} from "~/utils/sensitive-tag-filter"

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

/** 公開中の画像作品（入口に大きく出すものはこの条件にする）。R18G は入口に出さない */
const baseWhere = (
  style: WorksWhere["style"],
  isSensitive: boolean,
): WorksWhere => ({
  style,
  ...(isSensitive
    ? { ratings: ["R18"] as const }
    : { ratings: ["G"] as const, isSensitive: false }),
  isNowCreatedAt: true,
  workType: "WORK",
})

/** R18 のタグのカードの数（4 列で並べるので 4 の倍数で出す） */
const R18_TASTE_COUNT = 8

/** 作品を探す手がかりにならないタグ */
const R18_META_TAG_PATTERN = /^(r-?18g?|nsfw|エロ|えろ|オリジナル|ai.*)$/i

const JAPANESE_PATTERN = /[ぁ-んァ-ヶ一-龠]/

/** タグを入口に出してよいか（英単語を分けて付けたタグはカードにしても分かりにくいので出さない） */
const isR18GenreTag = (tag: string) =>
  JAPANESE_PATTERN.test(tag) &&
  !R18_META_TAG_PATTERN.test(tag) &&
  isFeaturableSensitiveTag(tag)

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
export async function loadGenreWorks(
  key: GenreKey,
  options: { isSensitive?: boolean } = {},
) {
  const isSensitive = options.isSensitive === true
  const genre: GenreConfig = toGenreConfig(key, isSensitive)
  const base = baseWhere(genre.style, isSensitive)
  const liked: WorksWhere = {
    ...base,
    orderBy: "LIKES_COUNT",
    isOneWorkPerUser: true,
  }

  const toCoverWhere = (style: WorksWhere["style"]): WorksWhere => ({
    ...baseWhere(style, isSensitive),
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
        ...base,
        // 新着は小説・動画なども出す
        workType: undefined,
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
      withTastes: !isSensitive,
      cover2d: toCoverWhere(toGenreConfig("2d", isSensitive).style),
      cover25d: toCoverWhere(toGenreConfig("2.5d", isSensitive).style),
      cover3d: toCoverWhere(toGenreConfig("3d", isSensitive).style),
    },
  })

  const data = result.data

  /** 選んで見せる枠に出してよいか（全年齢は条件で絞ってあるので見ない） */
  const isFeaturable = (work: { tagNames?: readonly string[] | null }) =>
    !isSensitive || isFeaturableSensitiveWork(work)

  const weekWorks = data.weekWorks.filter(isFeaturable)
  const monthWorks = data.monthWorks.filter(isFeaturable)
  const classicWorks = data.classicWorks.filter(isFeaturable)

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

  const rankingWorks = takeUnused(weekWorks, RANKING_COUNT)
  const heroWorks = takeUnused([...monthWorks, ...classicWorks], HERO_COUNT)
  const pickedClassicWorks = takeUnused(classicWorks, CLASSICS_COUNT)

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
  const fixedTastes = genre.tastes.map((taste, index) => {
    const work = tasteWorks[index]?.find((item) => !usedTasteIds.has(item.id))
    if (work) {
      usedTasteIds.add(work.id)
    }
    return { tag: taste.tag, imageUrl: work?.smallThumbnailImageURL ?? null }
  })

  // R18 はタグを固定で持たず、人気の作品に付いているものから選ぶ
  const r18Pool = [
    ...new Map(
      [...weekWorks, ...monthWorks, ...classicWorks].map((work) => [
        work.id,
        work,
      ]),
    ).values(),
  ]
  const r18Tags = isSensitive
    ? pickTrendingTags(r18Pool, { limit: 24, isAllowed: isR18GenreTag })
    : []
  const r18Tastes = r18Tags.flatMap((tag) => {
    const work = r18Pool.find(
      (item) => item.tagNames?.includes(tag) && !usedTasteIds.has(item.id),
    )
    if (!work) return []
    usedTasteIds.add(work.id)
    return [{ tag, imageUrl: work.smallThumbnailImageURL ?? null }]
  })
  const tasteCards = r18Tastes.slice(
    0,
    Math.min(R18_TASTE_COUNT, Math.floor(r18Tastes.length / 4) * 4),
  )
  const tasteCardNames = new Set(tasteCards.map((taste) => taste.tag))

  const toCover = (
    works: readonly {
      tagNames?: readonly string[] | null
      smallThumbnailImageURL: string | null
    }[],
  ) => works.find(isFeaturable)?.smallThumbnailImageURL ?? null

  return {
    heroWorks,
    rankingWorks,
    classicWorks: pickedClassicWorks,
    newWorks: data.newWorks,
    tastes: isSensitive ? tasteCards : fixedTastes,
    trendingTags: isSensitive
      ? r18Tags.filter((tag) => !tasteCardNames.has(tag)).slice(0, 12)
      : pickTrendingTags(data.weekWorks, {
          limit: 12,
          excludes: genre.tastes.map((taste) => taste.tag),
        }),
    covers: {
      "2d": toCover(data.cover2d),
      "2.5d": toCover(data.cover25d),
      "3d": toCover(data.cover3d),
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
    $withTastes: Boolean!
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
    taste0: works(offset: 0, limit: 8, where: $taste0) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste1: works(offset: 0, limit: 8, where: $taste1) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste2: works(offset: 0, limit: 8, where: $taste2) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste3: works(offset: 0, limit: 8, where: $taste3) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste4: works(offset: 0, limit: 8, where: $taste4) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste5: works(offset: 0, limit: 8, where: $taste5) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste6: works(offset: 0, limit: 8, where: $taste6) @include(if: $withTastes) { id smallThumbnailImageURL }
    taste7: works(offset: 0, limit: 8, where: $taste7) @include(if: $withTastes) { id smallThumbnailImageURL }
    cover2d: works(offset: 0, limit: 6, where: $cover2d) { id smallThumbnailImageURL tagNames }
    cover25d: works(offset: 0, limit: 6, where: $cover25d) { id smallThumbnailImageURL tagNames }
    cover3d: works(offset: 0, limit: 6, where: $cover3d) { id smallThumbnailImageURL tagNames }
  }`,
  [GenreWorkCardFragment, GenreNewWorkFragment],
)
