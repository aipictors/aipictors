import { useNavigate, useLocation } from "@remix-run/react"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/lib/app/hooks/use-locale"
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

  return (
    <div className="grid grid-cols-3 gap-2">
      {tabLabels.map((label) => (
        <Button
          key={label}
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
          variant="secondary"
          className={label === activeTab ? "opacity-50" : ""}
        >
          {label}
        </Button>
      ))}
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
