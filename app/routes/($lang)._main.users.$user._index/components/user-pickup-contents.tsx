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
  userId: string
}

export function UserPickupContents(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: props.userId,
    },
  })

  const featureWorks = workRes?.user?.featuredWorks

  const workDisplayed = featureWorks ?? props.userPickupWorks

  return (
    <div className="items-center">
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
