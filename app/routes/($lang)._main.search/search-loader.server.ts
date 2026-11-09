import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { isbot } from "isbot"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { loaderClient } from "~/lib/loader-client"
import {
  getSearchCacheKv,
  getSearchDb,
  searchWorkIdsByText,
} from "~/lib/server/work-text-search.server"
import {
  buildWorksWhere,
  chooseSearchMode,
  collectRelatedTags,
  getCurrentPage,
  getOrderFilter,
  getPromptFilter,
  getRatingFilter,
  getSearchBasePath,
  getStyleFilter,
  getUserFilter,
  normalizeTagQuery,
  RESULTS_LIMIT,
  SIDEBAR_RANKING_LIMIT,
  TEXT_SEARCH_MAX_PAGE,
} from "~/routes/($lang)._main.search/utils/search-filters"
import { isR18Path } from "~/utils/content-mode"
import { buildSearchPath } from "~/utils/search-route"
import { isFeaturableSensitiveTag } from "~/utils/sensitive-tag-filter"
import { toListWorks } from "~/utils/to-list-works"

export async function searchLoader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const isSensitiveMode = isR18Path(url.pathname)
  const pathSearchQuery = props.params.q
    ? decodeURIComponent(props.params.q)
    : null
  const searchQuery = normalizeTagQuery(
    pathSearchQuery ?? url.searchParams.get("tag") ?? url.searchParams.get("q"),
  )
  const currentPage = getCurrentPage(url.searchParams.get("page"))
  const rating = getRatingFilter(
    url.searchParams.get("age_limit") ?? url.searchParams.get("rating"),
    isSensitiveMode,
  )
  const style = getStyleFilter(url.searchParams.get("style"))
  const prompt = getPromptFilter(url.searchParams.get("prompt"))
  const order = getOrderFilter(url.searchParams.get("order"))
  const filterUserId = getUserFilter(url.searchParams.get("user"))
  const defaultRating = isSensitiveMode ? "R18" : "G"
  // /search?age_limit=R18 と /r/search?age_limit=G のねじれをなくす（R18 の表示は /r に揃える）
  const isOnRatingPage = (rating === "R18") === isSensitiveMode
  const basePath = getSearchBasePath(
    url.pathname,
    rating === "R18" ? "R18" : "all",
  )

  if (
    !isOnRatingPage ||
    pathSearchQuery !== null ||
    url.searchParams.has("q") ||
    url.searchParams.has("rating") ||
    (searchQuery !== null && !url.searchParams.has("age_limit")) ||
    url.searchParams.get("page") === "0"
  ) {
    const nextSearchParams = new URLSearchParams(url.searchParams)

    nextSearchParams.delete("q")
    nextSearchParams.delete("rating")
    nextSearchParams.set("age_limit", rating === "R15" ? "R15" : "")

    if (currentPage > 0) {
      nextSearchParams.set("page", String(currentPage))
    } else {
      nextSearchParams.delete("page")
    }

    return redirect(
      buildSearchPath(searchQuery, nextSearchParams, { basePath }),
    )
  }

  // isNowCreatedAt がないと works は投稿から 1 日以内の作品を返さない
  const resultWhere = {
    ...buildWorksWhere({
      tagQuery: searchQuery,
      rating,
      style,
      prompt,
      order,
      userId: filterUserId,
    }),
    isNowCreatedAt: true,
  }
  const shouldUseFilteredCount =
    style !== "all" || prompt !== "all" || filterUserId !== null
  const rankingWhere = buildWorksWhere({
    rating,
    style,
    prompt,
  })

  // タイトル・説明の部分一致（D1 の検索用データベース）。GraphQL の取得と並行して進める
  const searchDb = getSearchDb(props.context)
  const requestedMode = url.searchParams.get("mode")
  const textOffset =
    requestedMode !== "tag"
      ? Math.min(currentPage, TEXT_SEARCH_MAX_PAGE) * RESULTS_LIMIT
      : 0
  // D1 には投稿者がないので、自分の作品だけのときは GraphQL で探す（1 人分なので重くない）
  const searchOwnWorkIds = async (query: string) => {
    const where = {
      ...buildWorksWhere({
        rating,
        style: "all",
        prompt: "all",
        order,
        userId: filterUserId,
      }),
      search: query,
      searchInTags: true,
      searchInDescription: true,
      isNowCreatedAt: true,
    }
    const [idsResp, countResp] = await Promise.all([
      loaderClient.query({
        query: searchOwnWorkIdsQuery,
        variables: { offset: textOffset, limit: RESULTS_LIMIT, where },
      }),
      loaderClient.query({ query: worksCountQuery, variables: { where } }),
    ])
    return {
      ids: idsResp.data.works.map((work) => work.id),
      count: countResp.data.worksCount,
    }
  }
  const textSearchPromise =
    searchQuery === null
      ? null
      : filterUserId !== null
        ? searchOwnWorkIds(searchQuery)
        : searchDb
          ? searchWorkIdsByText({
              db: searchDb,
              kv: getSearchCacheKv(props.context),
              skipShortScan: isbot(props.request.headers.get("user-agent")),
              query: searchQuery,
              rating,
              order,
              offset: textOffset,
              limit: RESULTS_LIMIT,
            })
          : null
  const textResultPromise = textSearchPromise
    ? textSearchPromise.catch((error) => {
        console.error("text search failed", error)
        return null
      })
    : Promise.resolve(null)
  const fetchTextWorks = async (ids: string[]) => {
    if (ids.length === 0) return []
    try {
      const resp = await loaderClient.query({
        query: searchTextWorksQuery,
        variables: {
          offset: 0,
          limit: ids.length,
          where: { ids, ratings: [rating], isNowCreatedAt: true },
        },
      })
      const byId = new Map(resp.data.works.map((work) => [work.id, work]))
      return ids.map((id) => byId.get(id)).filter((work) => work !== undefined)
    } catch {
      return []
    }
  }
  // タイトル・説明のタブを開いているときは、作品の取得も先に始めておく
  const eagerTextWorksPromise =
    requestedMode !== "tag"
      ? textResultPromise.then((result) => fetchTextWorks(result?.ids ?? []))
      : null

  const [popularTagsResp, rankingResp, worksResp, worksCountResp] =
    await Promise.all([
      loaderClient.query({
        query: popularTagsQuery,
        variables: {
          limit: searchQuery ? 12 : 40,
          where: { isSensitive: isSensitiveMode },
        },
      }),
      loaderClient.query({
        query: rankingWorksQuery,
        variables: {
          offset: 0,
          limit: SIDEBAR_RANKING_LIMIT,
          where: rankingWhere,
        },
      }),
      searchQuery
        ? loaderClient.query({
            query: searchTagWorksQuery,
            variables: {
              offset: currentPage * RESULTS_LIMIT,
              limit: RESULTS_LIMIT,
              where: resultWhere,
            },
          })
        : Promise.resolve(null),
      searchQuery
        ? shouldUseFilteredCount
          ? loaderClient.query({
              query: worksCountQuery,
              variables: { where: resultWhere },
            })
          : loaderClient.query({
              query: tagWorksCountQuery,
              variables: {
                where: {
                  ratings: [rating],
                  tagName: searchQuery,
                },
              },
            })
        : Promise.resolve(null),
    ])

  const textResult = await textResultPromise
  const worksCountData = worksCountResp?.data
  const tagWorksCount =
    worksCountData === undefined
      ? 0
      : "worksCount" in worksCountData
        ? worksCountData.worksCount
        : worksCountData.tagWorksCount
  const mode = chooseSearchMode({ textResult, requestedMode, tagWorksCount })

  const textWorks =
    mode !== "text"
      ? []
      : eagerTextWorksPromise
        ? await eagerTextWorksPromise
        : await fetchTextWorks(textResult?.ids ?? [])

  const works = mode === "text" ? textWorks : (worksResp?.data?.tagWorks ?? [])
  const relatedTags = collectRelatedTags(works, searchQuery)

  return {
    relatedTags: isSensitiveMode
      ? relatedTags.filter(isFeaturableSensitiveTag)
      : relatedTags,
    filters: {
      order,
      prompt,
      rating,
      style,
      userId: filterUserId,
    },
    currentPage,
    isSensitiveMode,
    popularTags:
      popularTagsResp.data?.recommendedTags
        ?.map((tag) => ({
          name: tag.tagName,
          thumbnailUrl: tag.thumbnailUrl,
        }))
        // 入口に出すタグは、ガイドラインに触れそうなものを除いてから HTML に入れる
        .filter(
          (tag) => !isSensitiveMode || isFeaturableSensitiveTag(tag.name),
        ) ?? [],
    rankingWorks: toListWorks(rankingResp.data?.works),
    searchQuery,
    works: toListWorks(works),
    mode,
    tagWorksCount,
    textWorksCount: textResult?.count ?? null,
    worksCount: mode === "text" ? (textResult?.count ?? 0) : tagWorksCount,
  }
}

export type SearchLoaderData = SerializeFrom<typeof searchLoader>

const rankingWorksQuery = graphql(
  `query SearchRankingWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const searchTagWorksQuery = graphql(
  `query SearchTagWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
      tagNames
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const searchTextWorksQuery = graphql(
  `query SearchTextWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
      tagNames
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const searchOwnWorkIdsQuery = graphql(
  `query SearchOwnWorkIds($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      id
    }
  }`,
)

const worksCountQuery = graphql(
  `query SearchTagWorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const tagWorksCountQuery = graphql(
  `query SearchExactTagWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)

const popularTagsQuery = graphql(
  `query SearchPopularTags($limit: Int!, $where: RecommendedTagsWhereInput!) {
    recommendedTags(limit: $limit, where: $where) {
      tagName
      thumbnailUrl
    }
  }`,
)
