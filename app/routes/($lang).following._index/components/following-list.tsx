import { ResponsivePagination } from "~/components/responsive-pagination"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { FollowingUserItem } from "~/routes/($lang).following._index/components/following-user-item"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import React from "react"
import { useContext } from "react"
import {
  FollowerListItemFragment,
  FollowerListItemWorkFragment,
} from "~/routes/($lang).followers._index/components/follower-user-item"

export function FollowingList() {
  const [page, setPage] = React.useState(0)

  const authContext = useContext(AuthContext)

  if (authContext.userId === undefined || !authContext.userId) {
    return null
  }

  const userResp = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId,
      followeesOffset: 16 * page,
      followeesLimit: 16,
      followeesWorksOffset: 0,
      followeesWorksLimit: 8,
      followeesWorksWhere: {},
    },
  })

  return (
    <>
      <div>
        <div className="space-y-2">
          {userResp.data?.user?.followees.map((follower, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={index} className="space-y-2">
              <FollowingUserItem user={follower} works={follower.works} />
              <Separator />
            </div>
          ))}
        </div>
        <ResponsivePagination
          perPage={16}
          maxCount={userResp.data?.user?.followeesCount ?? 0}
          currentPage={page}
          onPageChange={(page: number) => {
            setPage(page)
          }}
        />
      </div>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $followeesOffset: Int!,
    $followeesLimit: Int!,
    $followeesWorksOffset: Int!,
    $followeesWorksLimit: Int!,
    $followeesWorksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      followeesCount
      followees(offset: $followeesOffset, limit: $followeesLimit) {
        id
        ...FollowerListItem
        works(offset: $followeesWorksOffset, limit: $followeesWorksLimit, where: $followeesWorksWhere) {
          ...FollowerListItemWork
        }
      }
    }
  }`,
  [FollowerListItemFragment, FollowerListItemWorkFragment],
)
