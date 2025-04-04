import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import {
  BookmarkWorksList,
  BookmarkWorksListItemFragment,
} from "~/routes/($lang).my._index/components/bookmark-works-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

/**
 * いいね一覧コンテナ
 */
export function LikeListContainer(props: Props) {
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
      likesOffset: 16 * props.page,
      likesLimit: 16,
      userId: decodeURIComponent(authContext.userId),
    },
  })

  const works = userResp?.user?.likedWorks ?? []

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
    $likesOffset: Int!,
    $likesLimit: Int!,
    $likesWhere: UserWorksWhereInput,
  ) {
    user(id: $userId) {
      id
      likedWorks(offset: $likesOffset, limit: $likesLimit, where: $likesWhere) {
        ...BookmarkWorksListItem
      }
    }
  }`,
  [BookmarkWorksListItemFragment],
)
