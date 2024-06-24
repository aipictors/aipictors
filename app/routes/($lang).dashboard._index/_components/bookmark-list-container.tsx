import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { userQuery } from "@/_graphql/queries/user/user"
import { BookmarkWorksList } from "@/routes/($lang).dashboard._index/_components/bookmark-works-list"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { useQuery } from "@apollo/client/index"

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
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
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
