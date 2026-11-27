import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/cloudflare"
import { json, redirect } from "@remix-run/cloudflare"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import { HomeHotWorkFragment } from "~/routes/($lang)._main._index/components/home-hot-carousel"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HOME_HOT_TAGS_COUNT,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import {
  HomePromotionWorkFragment,
  RECOMMENDED_PAD_COUNT,
} from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { RECOMMENDED_PER_PAGE } from "~/routes/($lang)._main._index/components/recommended-feed-contents"
import { buildHomeEventPreviews } from "~/routes/($lang)._main._index/utils/home-event-previews"
import {
  createEmptyReleaseList,
  getRandomHomeCategories,
  getUtcDateString,
  toHomeListWorks,
  toReleaseSummary,
} from "~/routes/($lang)._main._index/utils/home-loader-data"
import { HOME_TAB_PATHS } from "~/routes/($lang)._main._index/utils/home-tabs"
import { PER_IMG } from "~/routes/($lang)._main._index/utils/works-utils"
import {
  getHomeTagWorks,
  HomeTagRowWorkFragment,
  type HomeTagWorksResponse,
  type HomeTagWorksRow,
} from "~/routes/api.home-tag-works/route"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { getJstDate } from "~/utils/jst-date"
import {
  fetchFeaturedTaggedReleases,
  fetchLatestImportantRelease,
  fetchReleaseList,
  isImportantReleaseVisible,
} from "~/utils/micro-cms-release"

const createBaseHomeLoaderData = (props: {
  awardDateText: string
  firstTag: string
  secondTag: string
  releaseList: MicroCmsApiReleaseResponse
  featuredReleaseList: MicroCmsApiRelease[]
  importantRelease: MicroCmsApiRelease | null
}) => ({
  awardDateText: props.awardDateText,
  dailyTheme: null,
  eventPreviews: [] as HomePreviewEvent[],
  firstTag: props.firstTag,
  featuredReleaseList: props.featuredReleaseList,
  hotWorks: [] as FragmentOf<typeof HomeHotWorkFragment>[],
  hotTags: [] as FragmentOf<typeof HomeTagListItemFragment>[],
  importantRelease: props.importantRelease,
  initialNewWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  initialRecommendedWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  newComments: [] as FragmentOf<typeof HomeNewCommentsFragment>[],
  newPostedUsers: [] as FragmentOf<typeof HomeNewPostedUsersFragment>[],
  newUserWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  promotionWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  promotionFillWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  recommendedTags: [] as FragmentOf<typeof HomeTagFragment>[],
  releaseList: props.releaseList,
  secondTag: props.secondTag,
  secondTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
  workAwards: [] as FragmentOf<typeof HomeWorkAwardFragment>[],
  firstTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
  tagWorkRows: [] as HomeTagWorksRow[],
  rankingWorks: [] as HomeTagWorksRow["works"],
  trendWorks: [] as HomeTagWorksRow["works"],
  rankingDateText: props.awardDateText,
  newWorksShelf: [] as HomeTagWorksRow["works"],
  topCreators: [] as HomeTopCreator[],
})

/** トップの「人気のクリエイター」（前日のユーザーランキングの上位） */
export type HomeTopCreator = {
  id: string
  login: string
  name: string
  iconUrl: string | null
  rank: number
}

/** 人気のクリエイターに出す人数 */
const HOME_TOP_CREATORS_COUNT = 12

const toDateText = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

const RELEASES_CACHE_MS = 60 * 1000
const releasesCache = new Map<string, { expiresAt: number; value: unknown }>()

/**
 * お知らせ（microCMS）は全員共通で、外部サービスの応答をページのたびに 3 回待っていたので isolate で少し使い回す。
 * Workers は別のリクエストの I/O を待てないので、届いた値だけを覚える
 */
const memoizeReleases = async <T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> => {
  const cached = releasesCache.get(key)
  if (cached !== undefined && cached.expiresAt > Date.now()) {
    return cached.value as T
  }
  const value = await load()
  releasesCache.set(key, {
    expiresAt: Date.now() + RELEASES_CACHE_MS,
    value,
  })
  return value
}

/**
 * トップの上に出すお知らせ（サイトのお知らせ・重要なお知らせ）。全年齢と R18 のトップで共通
 */
export async function loadHomeReleases(nowMs: number) {
  const [releaseList, featuredReleaseList, latestImportantRelease] =
    await Promise.all([
      memoizeReleases("list", () => fetchReleaseList({ limit: 4 })).catch(
        (): MicroCmsApiReleaseResponse => ({
          contents: [],
          totalCount: 0,
          offset: 0,
          limit: 4,
        }),
      ),
      memoizeReleases("featured", () => fetchFeaturedTaggedReleases()).catch(
        (): MicroCmsApiRelease[] => [],
      ),
      memoizeReleases("important", () => fetchLatestImportantRelease()).catch(
        (): MicroCmsApiRelease | null => null,
      ),
    ])

  const safeReleaseList =
    releaseList && Array.isArray(releaseList.contents)
      ? { ...releaseList, contents: releaseList.contents.map(toReleaseSummary) }
      : createEmptyReleaseList()

  return {
    releaseList: safeReleaseList,
    featuredReleaseList: Array.isArray(featuredReleaseList)
      ? featuredReleaseList.map(toReleaseSummary)
      : [],
    importantRelease:
      latestImportantRelease &&
      isImportantReleaseVisible(latestImportantRelease, nowMs)
        ? toReleaseSummary(latestImportantRelease)
        : null,
  }
}

export async function homeLoader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const legacyTab = url.searchParams.get("tab")
  const currentPathLeaf = url.pathname.split("/").filter(Boolean).at(-1) ?? ""
  const isRecommendedRoute = currentPathLeaf === "recommended"
  const isFollowUserRoute = currentPathLeaf === "follow-user-works"
  const isFollowTagRoute = currentPathLeaf === "follow-tag-works"
  const isNewWorksRoute = currentPathLeaf === "new-works"
  // トップ（/）がホーム（推薦・ランキングなどの欄）
  const isHomeRoute =
    !isRecommendedRoute &&
    !isFollowUserRoute &&
    !isFollowTagRoute &&
    !isNewWorksRoute

  if (
    legacyTab === "recommended" ||
    legacyTab === "new" ||
    legacyTab === "follow-user" ||
    legacyTab === "follow-tag"
  ) {
    url.pathname = HOME_TAB_PATHS[legacyTab]
    url.searchParams.delete("tab")

    return redirect(`${url.pathname}${url.search}`, { status: 302 })
  }

  const randomCategories = getRandomHomeCategories(new Date())

  const now = getJstDate()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const awardDateText = getUtcDateString(yesterday)
  const dayBeforeYesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  // お知らせ（microCMS）を待たずに、ページのデータも同時に取り始める
  const recommendedWorksRequest = isRecommendedRoute
    ? loaderClient.query({
        query: initialRecommendedWorksQuery,
        errorPolicy: "all",
        variables: { offset: 0, limit: RECOMMENDED_PER_PAGE },
      })
    : null
  const newWorksRequest = isNewWorksRoute
    ? loaderClient.query({
        query: initialNewWorksQuery,
        errorPolicy: "all",
        variables: {
          limit: PER_IMG,
          offset: 0,
          where: {
            beforeCreatedAt: new Date().toISOString(),
            isNowCreatedAt: true,
            orderBy: "DATE_CREATED",
            ratings: ["G", "R15"],
            // 「公開（新着無）」の作品は新着一覧に出さない
            accessTypes: ["PUBLIC"],
          },
        },
      })
    : null
  const homeRequest = isHomeRoute
    ? loaderClient.query({
        query: query,
        errorPolicy: "all",
        variables: {
          day: now.getDate(),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          // 最初に見える一覧と右カラムはサーバーで取ってHTMLに入れる（以前は表示後にログイン確認を待ってから取得していた）
          promotionLimit: config.query.homeWorkCount.promotion,
          awardYear: yesterday.getFullYear(),
          awardMonth: yesterday.getMonth() + 1,
          awardDay: yesterday.getDate(),
          // 前日のランキングは昼ごろに集計されるので、まだなければ前々日を出す
          olderAwardYear: dayBeforeYesterday.getFullYear(),
          olderAwardMonth: dayBeforeYesterday.getMonth() + 1,
          olderAwardDay: dayBeforeYesterday.getDate(),
          userRankingDate: toDateText(yesterday),
          olderUserRankingDate: toDateText(dayBeforeYesterday),
          topCreatorsLimit: HOME_TOP_CREATORS_COUNT,
        },
      })
    : null
  // タグごとの作品（今日のお題・人気タグ）も最初の HTML に入れる（拠点のキャッシュを /api/home-tag-works と共有）
  const tagWorksRequest = isHomeRoute
    ? getHomeTagWorks(false).catch((): HomeTagWorksResponse => ({ rows: [] }))
    : null
  // 先に失敗しても、await するまで未処理の拒否にしない
  for (const request of [
    recommendedWorksRequest,
    newWorksRequest,
    homeRequest,
  ]) {
    request?.catch(() => {})
  }

  const releases = await loadHomeReleases(now.getTime())

  const baseLoaderData = createBaseHomeLoaderData({
    awardDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
    ...releases,
  })

  if (!isHomeRoute) {
    if (isFollowUserRoute || isFollowTagRoute) {
      return json(baseLoaderData, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      })
    }

    // おすすめ（/recommended）は、ログインしていない人向けの並びをサーバーで取って、最初の表示に使う
    if (isRecommendedRoute) {
      const recommendedResult = await recommendedWorksRequest
      return json(
        {
          ...baseLoaderData,
          initialRecommendedWorks: Array.isArray(
            recommendedResult?.data?.recommendedFeedWorks,
          )
            ? recommendedResult.data.recommendedFeedWorks
            : [],
        },
        {
          headers: {
            "Cache-Control": config.cacheControl.home,
          },
        },
      )
    }

    const initialWorksResult = await newWorksRequest

    return json(
      {
        ...baseLoaderData,
        initialNewWorks: Array.isArray(initialWorksResult?.data?.works)
          ? initialWorksResult.data.works
          : [],
      },
      {
        headers: {
          "Cache-Control": config.cacheControl.home,
        },
      },
    )
  }

  const [result, tagWorks] = await Promise.all([homeRequest, tagWorksRequest])

  const resultData = result?.data
  const appEvents = Array.isArray(resultData?.appEvents)
    ? resultData.appEvents
    : []
  const userEvents = Array.isArray(resultData?.userEvents)
    ? resultData.userEvents
    : []
  const eventPreviews = buildHomeEventPreviews(appEvents, userEvents)

  // イベントは eventPreviews に変換したものだけを HTML に入れる
  const {
    appEvents: _appEvents,
    userEvents: _userEvents,
    rankingWorks: _rankingWorks,
    olderRankingWorks: _olderRankingWorks,
    hotWorks: _hotWorks,
    newWorksShelf: _newWorksShelf,
    userRankings: _userRankings,
    olderUserRankings: _olderUserRankings,
    ...homeData
  } = resultData ?? {}

  return json(
    {
      ...baseLoaderData,
      ...homeData,
      // 一覧に出すだけなので、詳細画面用の項目は HTML に入れない（作品のダイアログは開くときに取り直す）
      promotionWorks: toHomeListWorks(resultData?.promotionWorks),
      // 推薦が少ない日は、すぐ下の「ほかのおすすめ」で 4 段ぶんまで埋める（推薦・いま人気と重ならないように）
      promotionFillWorks: toHomeListWorks(
        toPromotionFillWorks(
          resultData?.promotionFillWorks,
          resultData?.promotionWorks,
          resultData?.hotWorks?.slice(0, HOME_TREND_WORKS_COUNT),
        ),
      ),
      eventPreviews,
      // いま人気（ちちぷいのトレンドと同じく、大きな一覧で 4 段分）。一覧に要る項目だけを HTML に入れる
      trendWorks: toTrendWorks(resultData?.hotWorks),
      // 上のタグの横並び（今日のお題の後ろに並べる）
      hotTags: Array.isArray(resultData?.hotTags)
        ? resultData.hotTags.slice(0, HOME_HOT_TAGS_COUNT)
        : [],
      recommendedTags: Array.isArray(resultData?.recommendedTags)
        ? resultData.recommendedTags
        : [],
      tagWorkRows: tagWorks?.rows ?? [],
      // デイリーランキング（上位 12 件を横に並べる）
      ...toHomeRanking(resultData, yesterday, dayBeforeYesterday),
      // 新着作品（ちちぷいのトップの新着と同じく、作品の一覧の最後に 4 段）
      newWorksShelf: Array.isArray(resultData?.newWorksShelf)
        ? resultData.newWorksShelf
        : [],
      topCreators: toTopCreators(
        resultData?.userRankings,
        resultData?.olderUserRankings,
      ),
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.home,
      },
    },
  )
}

/**
 * 推薦の後ろに足すおすすめ作品（推薦と合わせて推薦欄の件数まで。推薦・いま人気に出る作品は除く）
 */
function toPromotionFillWorks<T extends { id: string }>(
  feedWorks: T[] | null | undefined,
  promotionWorks: { id: string }[] | null | undefined,
  hotWorks: { id: string }[] | null | undefined,
): T[] {
  const shownIds = new Set(
    [...(promotionWorks ?? []), ...(hotWorks ?? [])].map((work) => work.id),
  )
  // 先頭の 5 件は推薦の最後の行を埋めるのに使う（home-works-users-recommended-section.tsx）
  const room =
    Math.max(
      0,
      config.query.homeWorkCount.promotion - (promotionWorks?.length ?? 0),
    ) + RECOMMENDED_PAD_COUNT
  return (feedWorks ?? [])
    .filter((work) => !shownIds.has(work.id))
    .slice(0, room)
}

/** いま人気の一覧に出す数（PC の 6 列で 4 段） */
const HOME_TREND_WORKS_COUNT = 24

function toTrendWorks(
  works: FragmentOf<typeof HomeHotWorkFragment>[] | undefined,
): HomeTagWorksRow["works"] {
  if (!Array.isArray(works)) return []
  return works.slice(0, HOME_TREND_WORKS_COUNT).map((work) => ({
    id: work.id,
    title: work.title,
    enTitle: work.enTitle ?? null,
    likesCount: work.likesCount,
    smallThumbnailImageURL: work.smallThumbnailImageURL,
    smallThumbnailImageWidth: work.smallThumbnailImageWidth,
    smallThumbnailImageHeight: work.smallThumbnailImageHeight,
    user: work.user ? { id: work.user.id } : null,
  }))
}

/** 前日のランキングがまだ集計されていなければ前々日の分 */
function toHomeRanking(
  data:
    | {
        rankingWorks?: { work: HomeTagWorksRow["works"][number] | null }[]
        olderRankingWorks?: { work: HomeTagWorksRow["works"][number] | null }[]
      }
    | undefined,
  yesterday: Date,
  dayBeforeYesterday: Date,
) {
  const latest = data?.rankingWorks ?? []
  const isLatest = latest.length > 0
  const date = isLatest ? yesterday : dayBeforeYesterday
  return {
    rankingWorks: (isLatest ? latest : (data?.olderRankingWorks ?? [])).flatMap(
      (award) => (award.work ? [award.work] : []),
    ),
    // 問い合わせ（getFullYear など）と同じ日付にする
    rankingDateText: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
  }
}

/** 前日のユーザーランキングがまだ集計されていなければ前々日の分（順位の昇順） */
function toTopCreators(
  latest:
    | { rank: number; user: Omit<HomeTopCreator, "rank"> | null }[]
    | null
    | undefined,
  older:
    | { rank: number; user: Omit<HomeTopCreator, "rank"> | null }[]
    | null
    | undefined,
): HomeTopCreator[] {
  const rankings = (latest ?? []).length > 0 ? (latest ?? []) : (older ?? [])
  return rankings
    .flatMap((ranking) =>
      ranking.user
        ? [
            {
              id: ranking.user.id,
              login: ranking.user.login,
              name: ranking.user.name,
              iconUrl: ranking.user.iconUrl || null,
              rank: ranking.rank,
            },
          ]
        : [],
    )
    .sort((a, b) => a.rank - b.rank)
    .slice(0, HOME_TOP_CREATORS_COUNT)
}

export type HomeLoaderData = SerializeFrom<typeof homeLoader>

const initialRecommendedWorksQuery = graphql(
  `query InitialRecommendedWorks($offset: Int!, $limit: Int!) {
    recommendedFeedWorks(offset: $offset, limit: $limit, ratings: [G, R15]) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const initialNewWorksQuery = graphql(
  `query InitialNewWorks($offset:Int!,$limit:Int!,$where:WorksWhereInput!) {
     works(offset:$offset,limit:$limit,where:$where){
       ...HomeWork
       ...HomeNovelsWorkListItem
       ...HomeVideosWorkListItem
     }
   }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)

const query = graphql(
  `query HomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
    $promotionLimit: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $olderAwardYear: Int!
    $olderAwardMonth: Int!
    $olderAwardDay: Int!
    $userRankingDate: String!
    $olderUserRankingDate: String!
    $topCreatorsLimit: Int!
  ) {
    newWorksShelf: works(
      offset: 0
      limit: 24
      where: {
        ratings: [G, R15]
        isNowCreatedAt: true
        orderBy: DATE_CREATED
        accessTypes: [PUBLIC]
      }
    ) {
      ...HomeTagRowWork
    }
    userRankings(
      offset: 0
      limit: $topCreatorsLimit
      where: { date: $userRankingDate, orderBy: RANK, sort: ASC }
    ) {
      rank
      user {
        id
        login
        name
        iconUrl
      }
    }
    olderUserRankings: userRankings(
      offset: 0
      limit: $topCreatorsLimit
      where: { date: $olderUserRankingDate, orderBy: RANK, sort: ASC }
    ) {
      rank
      user {
        id
        login
        name
        iconUrl
      }
    }
    rankingWorks: workAwards(
      offset: 0
      limit: 12
      where: { year: $awardYear, month: $awardMonth, day: $awardDay, isSensitive: false }
    ) {
      id
      work {
        ...HomeTagRowWork
      }
    }
    olderRankingWorks: workAwards(
      offset: 0
      limit: 12
      where: { year: $olderAwardYear, month: $olderAwardMonth, day: $olderAwardDay, isSensitive: false }
    ) {
      id
      work {
        ...HomeTagRowWork
      }
    }
    promotionWorks: works(
      offset: 0
      limit: $promotionLimit
      where: { isRecommended: true, sort: DESC, ratings: [G, R15] }
    ) {
      ...HomePromotionWork
    }
    # 推薦・いま人気と重なる分を除いても、推薦の穴埋め＋「ほかのおすすめ」に足りるように多めに
    promotionFillWorks: recommendedFeedWorks(
      offset: 0
      limit: 32
      ratings: [G, R15]
    ) {
      ...HomePromotionWork
    }
    newPostedUsers(offset: 0, limit: 8) {
      ...HomeNewPostedUsers
    }
    newComments(
      offset: 0
      limit: 8
      where: { isSensitive: false, isTextOnly: true, ratings: [G, R15] }
    ) {
      ...HomeNewComments
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      enTitle
      year
      month
      day
      worksCount
      firstWork {
        id
        smallThumbnailImageURL
      }
    }
    hotWorks(where: { isSensitive: false }) {
      ...HomeHotWork
    }
    hotTags {
      ...HomeTagListItem
    }
    recommendedTags: recommendedTags(
      limit: 16
      where: {
        isSensitive: false,
      }
    ) {
      ...HomeTag
    }
    appEvents(limit: 12, offset: 0) {
      id
      slug
      title
      thumbnailImageUrl
      status
      startAt
      endAt
      tag
      worksCount
    }
    userEvents(limit: 12, offset: 0) {
      id
      slug
      title
      thumbnailImageUrl
      headerImageUrl
      status
      startAt
      endAt
      mainTag
      tags
      rankingEnabled
      entryCount
      participantCount
      userId
      userIconUrl
      userName
    }
  }`,
  [
    HomeHotWorkFragment,
    HomeTagListItemFragment,
    HomeTagFragment,
    HomePromotionWorkFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
    HomeTagRowWorkFragment,
  ],
)
