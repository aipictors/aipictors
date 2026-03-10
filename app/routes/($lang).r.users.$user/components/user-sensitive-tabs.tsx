import { useQuery } from "@apollo/client/index"
import { useLocation, useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useLocale } from "~/hooks/use-locale"
import { cn } from "~/lib/utils"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"
import { handleUserSensitiveTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-sensitive-tab-navigation"
import { makeNavigateCallback } from "~/utils/make-navigate-callback"

type Props = {
  user: FragmentOf<typeof UserSensitiveTabsFragment>
}

export function UserSensitiveTabs(props: Props) {
  const user = readFragment(UserSensitiveTabsFragment, props.user)

  const location = useLocation()

  const locale = useLocale()

  // 実際のユーザー作品数を確認するクエリ（hasSensitive* が false でも作品があればタブを出す）
  const { data: worksCountData } = useQuery(UserSensitiveWorksCountQuery, {
    variables: {
      userId: user.id,
    },
  })

  const getActiveTab = useUserActiveTab({
    url: location.pathname,
    lang: locale,
  })

  const actualImageWorksCount = worksCountData?.imageWorksCount ?? 0
  const actualNovelWorksCount = worksCountData?.novelWorksCount ?? 0
  const actualVideoWorksCount = worksCountData?.videoWorksCount ?? 0
  const actualColumnWorksCount = worksCountData?.columnWorksCount ?? 0

  const tabLabels = useUserTabLabels({
    hasImageWorks: user.hasSensitiveImageWorks || actualImageWorksCount > 0,
    hasNovelWorks: user.hasSensitiveNovelWorks || actualNovelWorksCount > 0,
    hasVideoWorks: user.hasSensitiveVideoWorks || actualVideoWorksCount > 0,
    hasColumnWorks: user.hasSensitiveColumnWorks || actualColumnWorksCount > 0,
    hasFolders: user.hasFolders,
    hasAlbums: user.hasAlbums,
    hasPublicStickers: user.hasPublicStickers,
    hasBadges: user.hasBadges,
    lang: locale,
  })

  const activeTab = getActiveTab()

  const navigate = useNavigate()
  const onNavigateCallback = makeNavigateCallback(navigate, {
    preventScrollReset: true,
  })

  const isPrimaryTab = (label: string) => {
    // タブラベルはロケールによって変わるため、簡易的に代表文字列で判定
    return label === "画像" || /^images?$/i.test(label)
  }

  return (
    <div className="border-border/40 border-b">
      <div className="flex w-full gap-6 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
        {tabLabels.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              handleUserSensitiveTabNavigation({
                type: label,
                userId: user.login,
                lang: locale,
                onNavigateCallback,
              })
            }}
            className={cn(
              "relative shrink-0 whitespace-nowrap px-1 py-3 font-medium text-sm transition-colors",
              label === activeTab && "text-foreground",
              label !== activeTab &&
                (isPrimaryTab(label)
                  ? "text-foreground/80 hover:text-foreground"
                  : "text-muted-foreground hover:text-foreground"),
              label === activeTab &&
                "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const UserSensitiveTabsFragment = graphql(
  `fragment UserSensitiveTabsFragment on UserNode {
    id
    login
    hasSensitiveImageWorks
    hasSensitiveNovelWorks
    hasSensitiveVideoWorks
    hasSensitiveColumnWorks
    hasFolders
    hasAlbums
    hasBadges
    hasPublicStickers
  }`,
)

export const UserSensitiveWorksCountQuery = graphql(
  `query UserSensitiveWorksCount($userId: ID!) {
    imageWorksCount: worksCount(where: { userId: $userId, workType: WORK, ratings: [R18, R18G], isSensitive: true })
    novelWorksCount: worksCount(where: { userId: $userId, workType: NOVEL, ratings: [R18, R18G], isSensitive: true })
    videoWorksCount: worksCount(where: { userId: $userId, workType: VIDEO, ratings: [R18, R18G], isSensitive: true })
    columnWorksCount: worksCount(where: { userId: $userId, workType: COLUMN, ratings: [R18, R18G], isSensitive: true })
  }`,
)
