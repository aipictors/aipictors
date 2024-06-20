import type { SortType } from "@/_types/sort-type"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { worksQuery } from "@/_graphql/queries/work/works"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { WorksList } from "@/routes/($lang).dashboard._index/_components/works-list"
import { useSuspenseQuery } from "@apollo/client/index"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"

type Props = {
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  setWorksMaxCount: (worksMaxCount: number) => void
  setWorkTabType: (workTabType: WorkTabType | null) => void
  setAccessType: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  setSort: (sort: SortType) => void
  setPage: (page: number) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  albumsCountRefetch: () => void
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

  const { data: workResp, refetch: workRespRefetch } = useSuspenseQuery(
    worksQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        offset: 16 * props.page,
        limit: 16,
        where: {
          userId: authContext.userId,
          orderBy: props.orderBy,
          sort: props.sort,
          isIncludePrivate: true,
          isNowCreatedAt: true,
          ...(props.accessType !== null && {
            accessTypes: [props.accessType],
          }),
          ...(props.workType !== null && {
            workTypes: [props.workType],
          }),
          ...(props.rating !== null && {
            ratings: [props.rating],
          }),
        },
      },
    },
  )

  const { data: worksCountResp, refetch: worksCountRespRefetch } =
    useSuspenseQuery(worksCountQuery, {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        where: {
          userId: authContext.userId,
          orderBy: props.orderBy,
          sort: props.sort,
          isIncludePrivate: true,
          isNowCreatedAt: true,
          ...(props.accessType !== null && {
            accessTypes: [props.accessType],
          }),
          ...(props.workType !== null && {
            workTypes: [props.workType],
          }),
          ...(props.rating !== null && {
            ratings: [props.rating],
          }),
        },
      },
    })

  const works = workResp?.works

  const worksMaxCount = worksCountResp?.worksCount ?? 0

  useEffect(() => {
    props.setWorksMaxCount(worksMaxCount)
  }, [worksMaxCount])

  return (
    <>
      <WorksList
        works={
          works?.map((work) => ({
            id: work.id,
            uuid: work.uuid ?? "",
            title: work.title,
            thumbnailImageUrl: work.smallThumbnailImageURL,
            likesCount: work.likesCount,
            bookmarksCount: work.bookmarksCount ?? 0,
            commentsCount: work.commentsCount ?? 0,
            viewsCount: work.viewsCount,
            accessType: work.accessType,
            createdAt: toDateTimeText(work.createdAt),
            workType: work.type as "COLUMN" | "NOVEL" | "VIDEO" | "WORK",
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
        onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
        onClickDateSortButton={props.onClickDateSortButton}
        onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
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
