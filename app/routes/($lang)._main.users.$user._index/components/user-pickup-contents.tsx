import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { graphql, type FragmentOf } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

type Props = {
  userPickupWorks: FragmentOf<typeof HomeWorkFragment>[]
  userNewWorks: FragmentOf<typeof HomeWorkFragment>[]
  userId: string
}

export function UserPickupContents (props: Props) {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: props.userId,
    },
  })

  const workDisplayed = workRes?.user?.featuredWorks ?? props.userPickupWorks

  const newWorkDisplayed = workRes?.user?.works ?? props.userNewWorks

  return (
    <div className="items-center">
      {newWorkDisplayed && newWorkDisplayed.length > 0 && (
        <HomeWorkSection
          title="最新"
          works={newWorkDisplayed}
          isCropped={false}
        />
      )}
      {workDisplayed && workDisplayed.length > 0 && (
        <HomeWorkSection
          title="ピックアップ"
          works={workDisplayed}
          isCropped={true}
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
