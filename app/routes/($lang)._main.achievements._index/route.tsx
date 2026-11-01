import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { config, META } from "~/config"
import { toAchievementShareCardUrl } from "~/lib/achievements/achievement-share"
import { loaderClient } from "~/lib/loader-client"
import { AchievementsPage } from "~/routes/($lang)._main.achievements._index/components/achievements-page"
import { createMeta } from "~/utils/create-meta"

/**
 * ?user=ID のときは、X などで大きなカード（アイコン・名前・実績レベル・達成数）が出るようにする
 */
export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const userId = url.searchParams.get("user")
  const highlight = url.searchParams.get("highlight")
  if (userId === null || !/^\d+$/.test(userId)) {
    return { share: null }
  }
  try {
    const result = await loaderClient.query({
      query: achievementShareQuery,
      variables: { userId },
    })
    const user = result.data?.user
    const summary = result.data?.achievementSummary
    if (!user || !summary) {
      return { share: null }
    }
    const highlightName =
      highlight === null
        ? null
        : (summary.featured.find((item) => item.key === highlight)?.name ??
          null)
    return {
      share: {
        name: user.name,
        level: summary.level,
        unlockedCount: summary.unlockedCount,
        totalCount: summary.totalCount,
        highlightName,
        image: toAchievementShareCardUrl({
          userId,
          unlockedCount: summary.unlockedCount,
          highlight,
        }),
      },
    }
  } catch {
    return { share: null }
  }
}

export const meta: MetaFunction<typeof loader> = (props) => {
  const share = props.data?.share
  if (!share) {
    return createMeta(META.ACHIEVEMENTS, undefined, props.params.lang)
  }
  return createMeta(
    {
      ...META.ACHIEVEMENTS,
      title: `${share.name}さんの実績 Lv.${share.level}（${share.unlockedCount}/${share.totalCount}）`,
      enTitle: `${share.name}'s achievements Lv.${share.level} (${share.unlockedCount}/${share.totalCount})`,
      description: share.highlightName
        ? `${share.name}さんが実績「${share.highlightName}」を達成しました！投稿・いいね・毎日のログインでバッジを集めよう`
        : `${share.name}さんは実績を ${share.unlockedCount} 個達成しています。投稿・いいね・毎日のログインでバッジを集めよう`,
      image: share.image,
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

/**
 * 実績（?user=ユーザーID で他の人の実績、?highlight=キー でその実績を開く）
 */
export default function Achievements() {
  return (
    <Suspense fallback={<AppLoadingPage />}>
      <AchievementsPage />
    </Suspense>
  )
}

const achievementShareQuery = graphql(
  `query AchievementShareMeta($userId: ID!) {
    user(id: $userId) {
      id
      name
    }
    achievementSummary(userId: $userId) {
      level
      unlockedCount
      totalCount
      featured {
        key
        name
      }
    }
  }`,
)
