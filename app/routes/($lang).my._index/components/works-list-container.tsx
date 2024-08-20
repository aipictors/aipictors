import type { SortType } from "~/types/sort-type"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { WorksList } from "~/routes/($lang).my._index/components/works-list"
import { useSuspenseQuery } from "@apollo/client/index"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"
import { MobileWorkListItemFragment } from "~/routes/($lang).my._index/components/works-sp-list"

type Props = {
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  setWorksMaxCount: (worksMaxCount: number) => void
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
}

/**
 * 作品一覧コンテナ
 */
export function WorksListContainer(props: Props) {
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
          ...(props.accessType !== null && {
            accessTypes: [props.accessType],
          }),
          ...(props.workType !== null && {
            workTypes: [props.workType],
          }),
          ...(props.rating !== null && {
            ratings: [props.rating],
          }),
          createdAtAfter: new Date("1999/01/01").toISOString(),
          beforeCreatedAt: new Date("2099/01/01").toISOString(),
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
        works={works ?? []}
        accessType={props.accessType}
        rating={props.rating}
        sort={props.sort}
        orderBy={props.orderBy}
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

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...MobileWorkListItem
    }
  }`,
  [MobileWorkListItemFragment],
)
