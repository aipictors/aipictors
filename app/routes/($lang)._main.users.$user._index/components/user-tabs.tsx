import { useLocation, useNavigate } from "react-router";
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/hooks/use-locale"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"
import { handleUserTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-tab-navigation"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
}

export function UserTabs(props: Props) {
  const user = readFragment(UserTabsFragment, props.user)

  const location = useLocation()

  const locale = useLocale()

  const getActiveTab = useUserActiveTab({
    url: location.pathname,
    lang: locale,
  })

  const tabLabels = useUserTabLabels({
    hasImageWorks: user.hasImageWorks,
    hasNovelWorks: user.hasNovelWorks,
    hasVideoWorks: user.hasVideoWorks,
    hasColumnWorks: user.hasColumnWorks,
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
            handleUserTabNavigation({
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
