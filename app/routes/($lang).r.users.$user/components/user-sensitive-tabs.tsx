import { useLocation, useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useLocale } from "~/hooks/use-locale"
import { cn } from "~/lib/utils"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"
import { handleUserSensitiveTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-sensitive-tab-navigation"

type Props = {
  user: FragmentOf<typeof UserSensitiveTabsFragment>
}

export function UserSensitiveTabs(props: Props) {
  const user = readFragment(UserSensitiveTabsFragment, props.user)

  const location = useLocation()

  const locale = useLocale()

  const getActiveTab = useUserActiveTab({
    url: location.pathname,
    lang: locale,
  })

  const tabLabels = useUserTabLabels({
    hasImageWorks: user.hasSensitiveImageWorks,
    hasNovelWorks: user.hasSensitiveNovelWorks,
    hasVideoWorks: user.hasSensitiveVideoWorks,
    hasColumnWorks: user.hasSensitiveColumnWorks,
    hasFolders: user.hasFolders,
    hasAlbums: user.hasAlbums,
    hasPublicStickers: user.hasPublicStickers,
    hasBadges: user.hasBadges,
    lang: locale,
  })

  const activeTab = getActiveTab()

  const navigate = useNavigate()

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
                onNavigateCallback: (url: string) => {
                  navigate(url)
                },
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
