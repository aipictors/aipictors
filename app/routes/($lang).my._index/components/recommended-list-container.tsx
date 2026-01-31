import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useSuspenseQuery } from "@apollo/client/index"
import {
  RecommendedWorkListItemFragment,
  RecommendedWorksList,
} from "~/routes/($lang).my._index/components/recommended-works-list"
import { graphql } from "gql.tada"

/**
 * 推薦一覧コンテナ
 */
export function RecommendedListContainer () {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: worksResp, refetch } = useSuspenseQuery(worksQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        isRecommended: true,
        recommendedWorksUserId: authContext.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R18G", "R15", "R18"],
      },
    },
  })

  const works = worksResp?.works ?? []

  return (
    <>
      <RecommendedWorksList works={works} />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...RecommendedWorkListItem
    }
  }`,
  [RecommendedWorkListItemFragment],
)
