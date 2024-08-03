import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { BookmarkWorksList } from "~/routes/($lang).my._index/components/bookmark-works-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useQuery } from "@apollo/client/index"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

/**
 * ブックマーク一覧コンテナ
 */
export const BookmarkListContainer = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: userResp, refetch } = useQuery(userQuery, {
    skip: authContext.isLoading,
    variables: {
      bookmarksOffset: 16 * props.page,
      bookmarksLimit: 16,
      userId: decodeURIComponent(authContext.userId),
    },
  })

  const works = userResp?.user?.bookmarkWorks ?? []

  return (
    <>
      <BookmarkWorksList
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
      <div className="mt-4 mb-8">
        <ResponsivePagination
          perPage={16}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
    $bookmarksOffset: Int!,
    $bookmarksLimit: Int!,
    $bookmarksWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      bookmarkWorks(offset: $bookmarksOffset, limit: $bookmarksLimit, where: $bookmarksWhere) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
