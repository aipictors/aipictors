import { useQuery } from "@apollo/client/index"
import { useLocation, useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useLocale } from "~/hooks/use-locale"
import { cn } from "~/lib/utils"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"
import { handleUserTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-tab-navigation"
import { makeNavigateCallback } from "~/utils/make-navigate-callback"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
}

export function UserTabs(props: Props) {
  const user = readFragment(UserTabsFragment, props.user)

  const location = useLocation()

  const locale = useLocale()

  // 実際のユーザー作品数を確認するクエリ
  const { data: worksCountData } = useQuery(UserWorksCountQuery, {
    variables: {
      userId: user.id,
    },
  })

  const getActiveTab = useUserActiveTab({
    url: location.pathname,
    lang: locale,
  })

  // 実際の作品数でタブの表示判定を行う
  const actualImageWorksCount = worksCountData?.imageWorksCount ?? 0
  const actualNovelWorksCount = worksCountData?.novelWorksCount ?? 0
  const actualVideoWorksCount = worksCountData?.videoWorksCount ?? 0
  const actualColumnWorksCount = worksCountData?.columnWorksCount ?? 0

  const tabLabels = useUserTabLabels({
    hasImageWorks: user.hasImageWorks || actualImageWorksCount > 0,
    hasNovelWorks: user.hasNovelWorks || actualNovelWorksCount > 0,
    hasVideoWorks: user.hasVideoWorks || actualVideoWorksCount > 0,
    hasColumnWorks: user.hasColumnWorks || actualColumnWorksCount > 0,
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
              handleUserTabNavigation({
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

export const UserTabsFragment = graphql(`
  fragment UserTabsFragment on UserNode {
    id
    login
    hasImageWorks
    hasNovelWorks
    hasVideoWorks
    hasColumnWorks
    hasFolders
    hasAlbums
    hasPublicStickers
    hasBadges
  }
`)

export const UserWorksCountQuery = graphql(`
  query UserWorksCount($userId: ID!) {
    imageWorksCount: worksCount(where: { userId: $userId, workType: WORK, ratings: [G, R15] })
    novelWorksCount: worksCount(where: { userId: $userId, workType: NOVEL, ratings: [G, R15] })
    videoWorksCount: worksCount(where: { userId: $userId, workType: VIDEO, ratings: [G, R15] })
    columnWorksCount: worksCount(where: { userId: $userId, workType: COLUMN, ratings: [G, R15] })
  }
`)
