import { ResponsivePagination } from "~/components/responsive-pagination"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import {
  FollowerListItemFragment,
  FollowerListItemWorkFragment,
  FollowerUserItem,
} from "~/routes/($lang).followers._index/components/follower-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import React from "react"
import { useContext } from "react"

export function FollowerList() {
  const [page, setPage] = React.useState(0)

  const authContext = useContext(AuthContext)

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  const userResp = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId,
      followersOffset: 16 * page,
      followersLimit: 16,
      followersWorksOffset: 16,
      followersWorksLimit: 16,
      followersWorksWhere: {},
    },
  })

  return (
    <>
      <div>
        <div className="space-y-2">
          {userResp.data?.user?.followers.map((follower, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="space-y-2">
              <FollowerUserItem user={follower} works={follower.works} />
              <Separator />
            </div>
          ))}
        </div>
        <div className="h-8" />
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <ResponsivePagination
            perPage={16}
            maxCount={userResp.data?.user?.followersCount ?? 0}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $followersOffset: Int!,
    $followersLimit: Int!,
    $followersWorksOffset: Int!,
    $followersWorksLimit: Int!
    $followersWorksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      followersCount
      followers(offset: $followersOffset, limit: $followersLimit) {
        id
        ...FollowerListItem
        works(offset: $followersWorksOffset, limit: $followersWorksLimit, where: $followersWorksWhere) {
          ...FollowerListItemWork
        }
      }
    }
  }`,
  [FollowerListItemFragment, FollowerListItemWorkFragment],
)
