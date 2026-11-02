import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import {
  UserFeaturedWorks,
  UserWorksGrid,
  UserWorksSection,
} from "~/routes/($lang)._main.users.$user._index/components/user-works-gallery"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
  userNewWorks: FragmentOf<typeof HomeWorkFragment>[]
  userId: string
  /** 作品一覧（画像）へのリンク */
  worksLink: string
}

export function UserPickupContents(props: Props) {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const { data: workRes } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: props.userId,
    },
  })

  const workDisplayed = workRes?.user?.featuredWorks ?? props.userPickupWorks

  const newWorkDisplayed = workRes?.user?.works ?? props.userNewWorks

  return (
    <>
      {workDisplayed && workDisplayed.length > 0 && (
        <UserWorksSection title={t("注目作品", "Featured")}>
          <UserFeaturedWorks works={workDisplayed} />
        </UserWorksSection>
      )}
      {newWorkDisplayed && newWorkDisplayed.length > 0 && (
        <UserWorksSection title={t("最新", "Latest")} link={props.worksLink}>
          <UserWorksGrid works={newWorkDisplayed} />
        </UserWorksSection>
      )}
    </>
  )
}

export const UserPickupFragment = graphql(
  `fragment UserPickup on UserNode @_unmask {
    featuredWorks {
      ...HomeWork
    }
    works(limit: 8, offset: 0, where: {
      ratings:[G, R15]
    }) {
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserPickup
    }
  }`,
  [UserPickupFragment],
)
