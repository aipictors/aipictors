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

export function UserSensitivePickupContents(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: workRes } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      userId: props.userId,
    },
  })

  const featureWorks = workRes?.user?.featuredSensitiveWorks

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

const UserContentsFragment = graphql(
  `fragment UserProfile on UserNode @_unmask {
    featuredWorks {
      ...HomeWork
    }
    featuredSensitiveWorks {
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
      ...UserProfile
    }
  }`,
  [UserContentsFragment],
)
