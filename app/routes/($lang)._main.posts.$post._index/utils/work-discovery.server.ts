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
 * 作品ページの下の一覧を、作品ページと一緒にサーバーで取る（件数: おすすめ 32・前日ランキング 20・同じお題 16）
 */
const workDiscoveryQuery = graphql(
  `query WorkDiscovery(
    $tagWhere: WorksWhereInput!
    $withTag: Boolean!
    $newWhere: WorksWhereInput!
    $withNew: Boolean!
    $themeWhere: WorksWhereInput!
    $withTheme: Boolean!
    $awardsWhere: WorkAwardsWhereInput!
    $olderAwardsWhere: WorkAwardsWhereInput!
  ) {
    tagWorks(offset: 0, limit: 32, where: $tagWhere) @include(if: $withTag) {
      ...PhotoAlbumWork
    }
    newWorks: works(offset: 0, limit: 32, where: $newWhere) @include(if: $withNew) {
      ...PhotoAlbumWork
    }
    themeWorks: works(offset: 0, limit: 16, where: $themeWhere) @include(if: $withTheme) {
      ...PhotoAlbumWork
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

type DiscoveryWork = FragmentOf<typeof PhotoAlbumWorkFragment>

type DiscoveryTarget = {
  id: string
  rating: DiscoveryRating | null
  tagNames: string[]
  dailyTheme: { id: string; title: string; dateText: string } | null
}

/**
 * 失敗しても作品ページは出す（空の一覧で返し、isComplete=false。呼び出し側でキャッシュを短くする）
 */
export async function fetchWorkDiscovery(
  work: DiscoveryTarget,
): Promise<{ discovery: WorkDiscovery; isComplete: boolean }> {
  const ratings = toDiscoveryRatings(work.rating)
  const isSensitive = ratings.includes("R18")
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

  const empty: WorkDiscovery = {
    tagName,
    tagWorks: [],
    awardDate,
    awardWorks: [],
    theme: work.dailyTheme
      ? { title: work.dailyTheme.title, dateText: work.dailyTheme.dateText }
      : null,
    themeWorks: [],
  }

  try {
    const resp = await loaderClient.query({
      query: workDiscoveryQuery,
      variables: {
        tagWhere: {
          tagNames: tagName ? [tagName] : [],
          ratings,
          isNowCreatedAt: true,
          ...(isSensitive && { isSensitive: true }),
        },
        withTag: tagName !== null,
        newWhere: {
          ratings,
          orderBy: "DATE_CREATED",
          isNowCreatedAt: true,
          ...(isSensitive && { isSensitive: true }),
        },
        withNew: tagName === null,
        themeWhere: {
          subjectId: hasTheme ? themeId : 0,
          ratings,
          orderBy: "DATE_CREATED",
          isNowCreatedAt: true,
          ...(isSensitive && { isSensitive: true }),
        },
        withTheme: hasTheme,
        awardsWhere: { ...awardDate, isSensitive },
        olderAwardsWhere: { ...olderAwardDate, isSensitive },
      },
    })
    const withoutSelf = (works: (DiscoveryWork | null | undefined)[]) =>
      works.filter(
        (item): item is DiscoveryWork =>
          item !== null && item !== undefined && item.id !== work.id,
      )
    const hasLatestAwards = (resp.data.workAwards ?? []).length > 0
    return {
      discovery: {
        ...empty,
        awardDate: hasLatestAwards ? awardDate : olderAwardDate,
        tagWorks: withoutSelf(resp.data.tagWorks ?? resp.data.newWorks ?? []),
        awardWorks: withoutSelf(
          (hasLatestAwards
            ? resp.data.workAwards
            : (resp.data.olderWorkAwards ?? [])
          ).map((award) => award.work),
        ),
        themeWorks: withoutSelf(resp.data.themeWorks ?? []),
      },
      isComplete: !resp.errors?.length,
    }
  } catch {
    return { discovery: empty, isComplete: false }
  }
}
