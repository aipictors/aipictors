import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { BookmarkWorksList } from "~/routes/($lang).my._index/components/bookmark-works-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { BookmarkWorksTableItemFragment } from "~/routes/($lang).my._index/components/bookmark-works-list-table"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

/**
 * ブックマーク一覧コンテナ
 */
export function BookmarkListContainer(props: Props) {
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
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      bookmarksOffset: 16 * props.page,
      bookmarksLimit: 16,
      userId: decodeURIComponent(authContext.userId),
    },
  })

  const works = userResp?.user?.bookmarkWorks ?? []

  return (
    <>
      <BookmarkWorksList works={works} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
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
        ...BookmarkWorksTableItem
      }
    }
  }`,
  [BookmarkWorksTableItemFragment],
)
