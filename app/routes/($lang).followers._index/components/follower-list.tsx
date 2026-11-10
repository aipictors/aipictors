import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import {
  FollowRelationUserFragment,
  FollowRelationView,
  FollowRelationWorkFragment,
  useFollowRelationParams,
} from "~/components/user/follow-relation-view"
import { AuthContext } from "~/contexts/auth-context"

export function FollowerList() {
  const authContext = useContext(AuthContext)
  const params = useFollowRelationParams()

  const { data, previousData, loading, error, refetch } = useQuery(followerListQuery, {
    skip: !authContext.userId,
    fetchPolicy: "cache-and-network",
    variables: {
      userId: authContext.userId ?? "",
      offset: params.perPage * params.page,
      limit: params.perPage,
      withWorks: params.mode === "default",
      worksWhere: params.worksWhere,
      where: {
        orderBy: params.orderBy,
        sort: params.sort,
      },
    },
  })

  const user = (data ?? previousData)?.user

  return (
    <FollowRelationView
      kind="followers"
      params={params}
      users={user?.followers}
      followingCount={user?.followeesCount}
      followersCount={user?.followersCount}
      isLoading={loading}
      hasError={error !== undefined}
      onRefresh={() => refetch()}
    />
  )
}

const followerListQuery = graphql(
  `query FollowerList(
    $userId: ID!,
    $offset: Int!,
    $limit: Int!,
    $withWorks: Boolean!,
    $worksWhere: UserWorksWhereInput,
    $where: FollowerWhereInput
  ) {
    user(id: $userId) {
      id
      followeesCount
      followersCount
      followers(offset: $offset, limit: $limit, where: $where) {
        id
        ...FollowRelationUser
        works(offset: 0, limit: 6, where: $worksWhere) @include(if: $withWorks) {
          ...FollowRelationWork
        }
      }
    }
  }`,
  [FollowRelationUserFragment, FollowRelationWorkFragment],
)
