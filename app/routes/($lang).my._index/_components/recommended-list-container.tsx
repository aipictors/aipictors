import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"
import { useSuspenseQuery } from "@apollo/client/index"
import { RecommendedWorksList } from "@/routes/($lang).my._index/_components/recommended-works-list"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

/**
 * 推薦一覧コンテナ
 */
export const RecommendedListContainer = () => {
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
    skip: authContext.isLoading,
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
      <RecommendedWorksList
        works={works.map((work) => ({
          id: work.id,
          title: work.title,
          thumbnailImageUrl: work.smallThumbnailImageURL,
          likesCount: work.likesCount,
          bookmarksCount: work.bookmarksCount ?? 0,
          commentsCount: work.commentsCount ?? 0,
          viewsCount: work.viewsCount,
          createdAt: toDateTimeText(work.createdAt), // Convert createdAt to string
          accessType: work.accessType,
          isTagEditable: work.isTagEditable,
        }))}
      />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
