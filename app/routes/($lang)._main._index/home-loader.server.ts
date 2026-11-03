import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/cloudflare"
import { json, redirect } from "@remix-run/cloudflare"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import type { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
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
  hotTags: [] as FragmentOf<typeof HomeTagListItemFragment>[],
  importantRelease: props.importantRelease,
  initialNewWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  newComments: [] as FragmentOf<typeof HomeNewCommentsFragment>[],
  newPostedUsers: [] as FragmentOf<typeof HomeNewPostedUsersFragment>[],
  newUserWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  promotionWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  recommendedTags: [] as FragmentOf<typeof HomeTagFragment>[],
  releaseList: props.releaseList,
  secondTag: props.secondTag,
  secondTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
  workAwards: [] as FragmentOf<typeof HomeWorkAwardFragment>[],
  firstTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
})

export async function homeLoader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const legacyTab = url.searchParams.get("tab")
  const currentPathLeaf = url.pathname.split("/").filter(Boolean).at(-1) ?? ""
  const isHomeRoute = currentPathLeaf === "home"
  const isFollowUserRoute = currentPathLeaf === "follow-user-works"
  const isFollowTagRoute = currentPathLeaf === "follow-tag-works"
  const isDefaultTopRoute =
    !isHomeRoute && !isFollowUserRoute && !isFollowTagRoute

  if (
    legacyTab === "home" ||
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

  const [releaseList, featuredReleaseList, latestImportantRelease] =
    await Promise.all([
      fetchReleaseList({
        limit: 4,
      }).catch(
        (): MicroCmsApiReleaseResponse => ({
          contents: [],
          totalCount: 0,
          offset: 0,
          limit: 4,
        }),
      ),
      fetchFeaturedTaggedReleases().catch((): MicroCmsApiRelease[] => []),
      fetchLatestImportantRelease().catch((): MicroCmsApiRelease | null => null),
    ])

  const safeReleaseList =
    releaseList && Array.isArray(releaseList.contents)
      ? { ...releaseList, contents: releaseList.contents.map(toReleaseSummary) }
      : createEmptyReleaseList()

  const baseLoaderData = createBaseHomeLoaderData({
    awardDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
    releaseList: safeReleaseList,
    featuredReleaseList: Array.isArray(featuredReleaseList)
      ? featuredReleaseList.map(toReleaseSummary)
      : [],
    importantRelease: latestImportantRelease && isImportantReleaseVisible(
      latestImportantRelease,
      now.getTime(),
    )
      ? toReleaseSummary(latestImportantRelease)
      : null,
  })

  if (!isHomeRoute) {
    if (!isDefaultTopRoute) {
      return json(baseLoaderData, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      })
    }

    const initialWorksResult = await loaderClient.query({
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

    return json(
      {
        ...baseLoaderData,
        initialNewWorks: Array.isArray(initialWorksResult.data?.works)
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

  const result = await loaderClient.query({
    query: query,
    errorPolicy: "all",
    variables: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      // 最初に見える一覧と右カラムはサーバーで取ってHTMLに入れる（以前は表示後にログイン確認を待ってから取得していた）
      promotionLimit: config.query.homeWorkCount.promotion,
      newUserWorksLimit: config.query.homeWorkCount.newUser,
    },
  })

  const resultData = result.data
  const appEvents = Array.isArray(resultData?.appEvents)
    ? resultData.appEvents
    : []
  const userEvents = Array.isArray(resultData?.userEvents)
    ? resultData.userEvents
    : []
  const eventPreviews = buildHomeEventPreviews(appEvents, userEvents)

  return json(
    {
      ...baseLoaderData,
      ...(resultData ?? {}),
      // 一覧に出すだけなので、詳細画面用の項目は HTML に入れない（作品のダイアログは開くときに取り直す）
      promotionWorks: toHomeListWorks(resultData?.promotionWorks),
      newUserWorks: toHomeListWorks(resultData?.newUserWorks),
      eventPreviews,
      hotTags: Array.isArray(resultData?.hotTags) ? resultData.hotTags : [],
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

export type HomeLoaderData = SerializeFrom<typeof homeLoader>

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
    $newUserWorksLimit: Int!
  ) {
    promotionWorks: works(
      offset: 0
      limit: $promotionLimit
      where: { isRecommended: true, sort: DESC, ratings: [G, R15] }
    ) {
      ...HomePromotionWork
    }
    newUserWorks(
      offset: 0
      limit: $newUserWorksLimit
      where: { ratings: [G], isNowCreatedAt: true }
    ) {
      ...HomeNewUsersWorks
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
    HomeTagListItemFragment,
    HomeTagFragment,
    HomePromotionWorkFragment,
    HomeNewUsersWorksFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
  ],
)
