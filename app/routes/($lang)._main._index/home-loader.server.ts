import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/cloudflare"
import { json, redirect } from "@remix-run/cloudflare"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import {
  HOME_HOT_WORKS_COUNT,
  HomeHotWorkFragment,
} from "~/routes/($lang)._main._index/components/home-hot-carousel"
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
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
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
})

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
        },
      })
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

  const result = await homeRequest

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
          resultData?.hotWorks?.slice(0, HOME_HOT_WORKS_COUNT),
        ),
      ),
      eventPreviews,
      // いま人気のカルーセル（アプリと同じ 10 件）
      hotWorks: Array.isArray(resultData?.hotWorks)
        ? resultData.hotWorks.slice(0, HOME_HOT_WORKS_COUNT)
        : [],
      // 上のタグの横並び（今日のお題の後ろに並べる）
      hotTags: Array.isArray(resultData?.hotTags)
        ? resultData.hotTags.slice(0, HOME_HOT_TAGS_COUNT)
        : [],
      recommendedTags: Array.isArray(resultData?.recommendedTags)
        ? resultData.recommendedTags
        : [],
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
  const room = Math.max(
    0,
    config.query.homeWorkCount.promotion - (promotionWorks?.length ?? 0),
  )
  return (feedWorks ?? [])
    .filter((work) => !shownIds.has(work.id))
    .slice(0, room)
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
  ) {
    promotionWorks: works(
      offset: 0
      limit: $promotionLimit
      where: { isRecommended: true, sort: DESC, ratings: [G, R15] }
    ) {
      ...HomePromotionWork
    }
    promotionFillWorks: recommendedFeedWorks(
      offset: 0
      limit: $promotionLimit
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
  ],
)
