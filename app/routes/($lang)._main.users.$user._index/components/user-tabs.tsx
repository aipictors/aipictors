import { useLocation, useNavigate } from "@remix-run/react"
import { graphql, readFragment, type FragmentOf } from "gql.tada"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/hooks/use-locale"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"
import { handleUserTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-tab-navigation"
import { useQuery } from "@apollo/client/index"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
}

export function UserTabs (props: Props) {
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

export const UserWorksCountQuery = graphql(`
  query UserWorksCount($userId: ID!) {
    imageWorksCount: worksCount(where: { userId: $userId, workType: WORK, ratings: [G, R15] })
    novelWorksCount: worksCount(where: { userId: $userId, workType: NOVEL, ratings: [G, R15] })
    videoWorksCount: worksCount(where: { userId: $userId, workType: VIDEO, ratings: [G, R15] })
    columnWorksCount: worksCount(where: { userId: $userId, workType: COLUMN, ratings: [G, R15] })
  }
`)
