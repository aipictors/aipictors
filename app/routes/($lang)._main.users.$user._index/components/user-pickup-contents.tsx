import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
  userNewWorks: FragmentOf<typeof HomeWorkFragment>[]
  userId: string
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
    <div className="space-y-6">
      {workDisplayed && workDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("注目作品", "Featured")}
          works={workDisplayed}
          isCropped={true}
        />
      )}
      {newWorkDisplayed && newWorkDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("最新", "Latest")}
          works={newWorkDisplayed}
          isCropped={false}
        />
      )}
    </div>
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
