import type { SortType } from "@/_types/sort-type"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import type {
  AccessType,
  Rating,
  WorkOrderBy,
} from "@/_graphql/__generated__/graphql"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { worksQuery } from "@/_graphql/queries/work/works"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { WorksList } from "@/routes/($lang).dashboard._index/_components/works-list"
import { useSuspenseQuery } from "@apollo/client/index"

type Props = {
  page: number
  sort: SortType
  orderBy: WorkOrderBy
  accessType: AccessType | null
  rating: Rating | null
  setWorksMaxCount: (worksMaxCount: number) => void
  setWorkTabType: (workTabType: WorkTabType | null) => void
  setAccessType: (accessType: AccessType | null) => void
  setRating: (rating: Rating | null) => void
  setSort: (sort: SortType) => void
  setPage: (page: number) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * 作品一覧コンテナ
 */
export const WorksListContainer = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  const workResp = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        userId: authContext.userId,
        orderBy: props.orderBy,
        sort: props.sort,
        isIncludePrivate: true,
        ...(props.accessType !== null && {
          accessTypes: [props.accessType],
        }),
        ...(props.rating !== null && {
          ratings: [props.rating],
        }),
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        userId: authContext.userId,
        orderBy: props.orderBy,
        sort: props.sort,
        isIncludePrivate: true,
        ...(props.accessType !== null && {
          accessTypes: [props.accessType],
        }),
        ...(props.rating !== null && {
          ratings: [props.rating],
        }),
      },
    },
  })

  const works = workResp?.data?.works

  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  useEffect(() => {
    props.setWorksMaxCount(worksMaxCount)
  }, [worksMaxCount])

  return (
    <>
      <WorksList
        works={
          works?.map((work) => ({
            id: work.id,
            title: work.title,
            thumbnailImageUrl: work.smallThumbnailImageURL,
            likesCount: work.likesCount,
            bookmarksCount: 0,
            commentsCount: work.commentsCount ?? 0,
            viewsCount: work.viewsCount,
            accessType: work.accessType,
            createdAt: toDateTimeText(work.createdAt),
            isTagEditable: work.isTagEditable,
          })) ?? []
        }
        accessType={props.accessType}
        rating={props.rating}
        sort={props.sort}
        orderBy={props.orderBy}
        setWorkTabType={props.setWorkTabType}
        setAccessType={props.setAccessType}
        setRating={props.setRating}
        setSort={props.setSort}
        onClickTitleSortButton={props.onClickTitleSortButton}
        onClickLikeSortButton={props.onClickLikeSortButton}
        onClickBookmarkSortButton={props.onClickBookmarkSortButton}
        onClickCommentSortButton={props.onClickCommentSortButton}
        onClickViewSortButton={props.onClickViewSortButton}
        onClickDateSortButton={props.onClickDateSortButton}
      />
      <div className="mt-4 mb-8">
        <ResponsivePagination
          perPage={16}
          maxCount={worksMaxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}