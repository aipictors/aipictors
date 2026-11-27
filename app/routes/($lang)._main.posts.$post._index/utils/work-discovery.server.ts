import { type FragmentOf, graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { loaderClient } from "~/lib/loader-client"
import {
  type DiscoveryRating,
  pickDiscoveryTag,
  toDiscoveryRatings,
  type WorkDiscovery,
} from "~/routes/($lang)._main.posts.$post._index/utils/work-discovery"
import { getJstDate } from "~/utils/jst-date"
import { isSuggestableSensitiveTag } from "~/utils/sensitive-tag-filter"

/**
 * 作品ページの下の一覧を、作品ページと一緒にサーバーで取る
 * （件数: おすすめ 32・前日ランキング 20・同じお題 16・同じモデル 24・新着 24・人気のタグ 20）。
 *
 * 新着・前日ランキング・人気のタグはどの作品ページでも同じ（年齢区分ごと）、
 * おすすめ・同じお題・同じモデルも同じタグ・お題・モデルの作品ページで同じなので、
 * 一覧ごとに分けて拠点のキャッシュに置き、作品ページごとに system へ問い合わせ直さない
 * （1 回の問い合わせで最大 約 150 作品を組み立てていて、system の CPU で一番重い問い合わせだった）
 */
const workDiscoverySharedQuery = graphql(
  `query WorkDiscoveryShared(
    $newWhere: WorksWhereInput!
    $isSensitive: Boolean!
    $awardsWhere: WorkAwardsWhereInput!
    $olderAwardsWhere: WorkAwardsWhereInput!
  ) {
    newWorks: works(offset: 0, limit: 24, where: $newWhere) {
      ...PhotoAlbumWork
    }
    hotTags @skip(if: $isSensitive) {
      name
    }
    hotSensitiveTags @include(if: $isSensitive) {
      name
    }
    workAwards(offset: 0, limit: 20, where: $awardsWhere) {
      id
      work {
        ...PhotoAlbumWork
      }
    }
    olderWorkAwards: workAwards(offset: 0, limit: 20, where: $olderAwardsWhere) {
      id
      work {
        ...PhotoAlbumWork
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const workDiscoveryTagQuery = graphql(
  `query WorkDiscoveryTag($where: WorksWhereInput!) {
    tagWorks(offset: 0, limit: 32, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const workDiscoveryThemeQuery = graphql(
  `query WorkDiscoveryTheme($where: WorksWhereInput!) {
    works(offset: 0, limit: 16, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const workDiscoveryModelQuery = graphql(
  `query WorkDiscoveryModel($modelName: String!, $where: WorksWhereInput!) {
    # works の modelNames は並び順を付けると効かないので、モデルのページと同じ aiModel.works で取る
    aiModel(where: { search: $modelName }) {
      works(offset: 0, limit: 24, where: $where) {
        ...PhotoAlbumWork
      }
    }
  }`,
  [PhotoAlbumWorkFragment],
)

type DiscoveryWork = FragmentOf<typeof PhotoAlbumWorkFragment>

type DiscoveryTarget = {
  id: string
  rating: DiscoveryRating | null
  tagNames: string[]
  dailyTheme: { id: string; title: string; dateText: string } | null
  model: string | null
}

type SharedSection = {
  newWorks: DiscoveryWork[]
  hotTagNames: string[]
  awardWorks: DiscoveryWork[]
  olderAwardWorks: DiscoveryWork[]
}

/** 一覧ごとの取得結果（ok=false は取れなかった・一部欠けた。キャッシュに置かない） */
type Section<T> = { data: T; ok: boolean }

/** モデル名が入っていても、どのモデルか分からないもの（同じモデルの一覧を出さない） */
const UNKNOWN_MODEL_NAMES = new Set([
  "その他",
  "CustomModel",
  "CustomModel(その他)",
])

/** 人気のタグの数 */
const HOT_TAGS_COUNT = 20

/** 一覧を拠点のキャッシュに置く時間（秒）。作品ページの HTML は 1 時間キャッシュするので、それより短く */
const SECTION_CACHE_SECONDS = 10 * 60

const SECTION_CACHE_ORIGIN = "https://www.aipictors.com/__work-discovery/v1"

/**
 * 拠点のキャッシュから一覧を読み、なければ取って置く（取れなかったときは置かない）
 */
async function withSectionCache<T>(
  path: string,
  load: () => Promise<Section<T>>,
): Promise<Section<T>> {
  const cache = typeof caches === "undefined" ? null : caches.default
  const cacheKey = new Request(`${SECTION_CACHE_ORIGIN}/${path}`)
  const cached = await cache?.match(cacheKey).catch(() => undefined)
  if (cached) {
    const data = (await cached.json().catch(() => null)) as T | null
    if (data !== null) return { data, ok: true }
  }
  const section = await load()
  if (cache && section.ok) {
    await cache
      .put(
        cacheKey,
        new Response(JSON.stringify(section.data), {
          headers: {
            "content-type": "application/json",
            "cache-control": `public, max-age=${SECTION_CACHE_SECONDS}`,
          },
        }),
      )
      .catch(() => {})
  }
  return section
}

const toWorks = (
  works: (DiscoveryWork | null | undefined)[] | null | undefined,
) =>
  (works ?? []).filter(
    (item): item is DiscoveryWork => item !== null && item !== undefined,
  )

/**
 * 失敗しても作品ページは出す（取れなかった一覧は空で返し、isComplete=false。呼び出し側でキャッシュを短くする）
 */
export async function fetchWorkDiscovery(
  work: DiscoveryTarget,
): Promise<{ discovery: WorkDiscovery; isComplete: boolean }> {
  const ratings = toDiscoveryRatings(work.rating)
  const isSensitive = ratings.includes("R18")
  const ratingsKey = ratings.join(",")
  // R18 は一覧に出してよいタグだけから選ぶ（未成年を連想させるタグなどへのリンクを作らない）
  const tagName = pickDiscoveryTag(
    work.id,
    isSensitive
      ? work.tagNames.filter((tag) => isSuggestableSensitiveTag(tag))
      : work.tagNames,
  )
  const toDate = (daysAgo: number) => {
    const date = new Date(
      getJstDate(new Date()).getTime() - daysAgo * 86_400_000,
    )
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }
  }
  // 前日のランキングは昼ごろに集計されるので、まだなければ前々日を出す
  const awardDate = toDate(1)
  const olderAwardDate = toDate(2)
  const themeId = work.dailyTheme ? Number(work.dailyTheme.id) : Number.NaN
  const hasTheme = Number.isInteger(themeId)
  const modelName = work.model?.trim() || null
  const hasModel = modelName !== null && !UNKNOWN_MODEL_NAMES.has(modelName)

  const empty: WorkDiscovery = {
    tagName,
    tagWorks: [],
    awardDate,
    awardWorks: [],
    theme: work.dailyTheme
      ? { title: work.dailyTheme.title, dateText: work.dailyTheme.dateText }
      : null,
    themeWorks: [],
    modelName: hasModel ? modelName : null,
    modelWorks: [],
    newWorks: [],
    hotTags: [],
  }

  const emptyShared: SharedSection = {
    newWorks: [],
    hotTagNames: [],
    awardWorks: [],
    olderAwardWorks: [],
  }
  const skipped = <T>(data: T): Promise<Section<T>> =>
    Promise.resolve({ data, ok: true })
  // 問い合わせが例外になっても（何も取れなかったなど）他の一覧は出す
  const guarded = <T>(
    empty: T,
    load: () => Promise<Section<T>>,
  ): Promise<Section<T>> => load().catch(() => ({ data: empty, ok: false }))

  const awardDateKey = `${awardDate.year}-${awardDate.month}-${awardDate.day}`

  const [shared, tagSection, themeSection, modelSection] = await Promise.all([
    guarded(emptyShared, () =>
      withSectionCache(`shared/${ratingsKey}/${awardDateKey}`, async () => {
        const resp = await loaderClient.query({
          query: workDiscoverySharedQuery,
          variables: {
            newWhere: {
              ratings,
              orderBy: "DATE_CREATED",
              isNowCreatedAt: true,
              // 「公開（新着無）」の作品は新着に出さない（トップの新着と同じ）
              accessTypes: ["PUBLIC"],
              ...(isSensitive && { isSensitive: true }),
            },
            isSensitive,
            awardsWhere: { ...awardDate, isSensitive },
            olderAwardsWhere: { ...olderAwardDate, isSensitive },
          },
        })
        return {
          data: {
            newWorks: toWorks(resp.data.newWorks),
            hotTagNames: (isSensitive
              ? (resp.data.hotSensitiveTags ?? [])
              : (resp.data.hotTags ?? [])
            ).map((tag) => tag.name),
            awardWorks: toWorks(
              (resp.data.workAwards ?? []).map((award) => award.work),
            ),
            olderAwardWorks: toWorks(
              (resp.data.olderWorkAwards ?? []).map((award) => award.work),
            ),
          },
          ok: !resp.errors?.length,
        }
      }),
    ),
    tagName === null
      ? skipped<DiscoveryWork[]>([])
      : guarded<DiscoveryWork[]>([], () =>
          withSectionCache(
            `tag/${ratingsKey}/${encodeURIComponent(tagName)}`,
            async () => {
              const resp = await loaderClient.query({
                query: workDiscoveryTagQuery,
                variables: {
                  where: {
                    tagNames: [tagName],
                    ratings,
                    isNowCreatedAt: true,
                    ...(isSensitive && { isSensitive: true }),
                  },
                },
              })
              return {
                data: toWorks(resp.data.tagWorks),
                ok: !resp.errors?.length,
              }
            },
          ),
        ),
    !hasTheme
      ? skipped<DiscoveryWork[]>([])
      : guarded<DiscoveryWork[]>([], () =>
          withSectionCache(`theme/${ratingsKey}/${themeId}`, async () => {
            const resp = await loaderClient.query({
              query: workDiscoveryThemeQuery,
              variables: {
                where: {
                  subjectId: themeId,
                  ratings,
                  orderBy: "DATE_CREATED",
                  isNowCreatedAt: true,
                  ...(isSensitive && { isSensitive: true }),
                },
              },
            })
            return { data: toWorks(resp.data.works), ok: !resp.errors?.length }
          }),
        ),
    !hasModel
      ? skipped<DiscoveryWork[]>([])
      : guarded<DiscoveryWork[]>([], () =>
          withSectionCache(
            `model/${ratingsKey}/${encodeURIComponent(modelName)}`,
            async () => {
              const resp = await loaderClient.query({
                query: workDiscoveryModelQuery,
                variables: {
                  modelName,
                  where: {
                    ratings,
                    orderBy: "DATE_CREATED",
                    isSensitive,
                  },
                },
              })
              return {
                data: toWorks(resp.data.aiModel?.works),
                ok: !resp.errors?.length,
              }
            },
          ),
        ),
  ])

  const withoutSelf = (works: DiscoveryWork[]) =>
    works.filter((item) => item.id !== work.id)
  const hasLatestAwards = shared.data.awardWorks.length > 0
  const tagWorks = withoutSelf(tagSection.data)
  const awardWorks = withoutSelf(
    hasLatestAwards ? shared.data.awardWorks : shared.data.olderAwardWorks,
  )
  const themeWorks = withoutSelf(themeSection.data)
  // 同じモデル・新着は、上の一覧に出た作品を除く（同じ作品へのリンクを何度も並べない）
  const shownIds = new Set(
    [...tagWorks, ...awardWorks, ...themeWorks].map((item) => item.id),
  )
  const withoutShown = (works: DiscoveryWork[]) => {
    const result = works.filter((item) => !shownIds.has(item.id))
    for (const item of result) shownIds.add(item.id)
    return result
  }
  const modelWorks = withoutShown(withoutSelf(modelSection.data))
  const newWorks = withoutShown(withoutSelf(shared.data.newWorks))
  const hotTagNames = shared.data.hotTagNames
    // R18 は一覧に出してよいタグだけ（おすすめのタグと同じ）
    .filter((name) => !isSensitive || isSuggestableSensitiveTag(name))
    .slice(0, HOT_TAGS_COUNT)

  return {
    discovery: {
      ...empty,
      awardDate: hasLatestAwards ? awardDate : olderAwardDate,
      tagWorks,
      awardWorks,
      themeWorks,
      modelWorks,
      newWorks,
      hotTags: hotTagNames,
    },
    isComplete:
      shared.ok && tagSection.ok && themeSection.ok && modelSection.ok,
  }
}
