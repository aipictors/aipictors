import type { SortType } from "~/types/sort-type"
import { AuthContext } from "~/contexts/auth-context"
import { useContext, useEffect } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { WorksList } from "~/routes/($lang).my._index/components/works-list"
import { useQuery } from "@apollo/client/index"
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
  isFixedPagination?: boolean
  perPage?: number
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
  onClickIsPromotionSortButton: () => void
  onClickAgeTypeSortButton: () => void
}

/**
 * 作品一覧コンテナ
 */
export function WorksListContainer(props: Props) {
  const authContext = useContext(AuthContext)

  // Hooksは常に呼び出す必要がある（条件分岐の前）
  const {
    data: workResp,
    loading: workLoading,
    error: workError,
  } = useQuery(worksQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      offset: (props.perPage ?? 50) * props.page,
      limit: props.perPage ?? 50,
      where: {
        userId: authContext.userId || "",
        orderBy: props.orderBy,
        sort: props.sort,
        isIncludePrivate: true,
        ...(props.accessType !== null && {
          accessTypes: [props.accessType],
        }),
        ...(props.workType !== null && {
          workTypes: [props.workType],
        }),
        ...(props.rating !== null
          ? {
              ratings: [props.rating],
            }
          : {
              ratings: ["G", "R15", "R18", "R18G"],
            }),
        createdAtAfter: new Date("1999/01/01").toISOString(),
        beforeCreatedAt: new Date("2099/01/01").toISOString(),
      },
    },
    errorPolicy: "all",
  })

  const {
    data: worksCountResp,
    loading: countLoading,
    error: countError,
  } = useQuery(worksCountQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      where: {
        userId: authContext.userId || "",
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
    errorPolicy: "all",
  })

  const works = workResp?.works
  const worksMaxCount = worksCountResp?.worksCount ?? 0

  useEffect(() => {
    props.setWorksMaxCount(worksMaxCount)
  }, [worksMaxCount, props])

  // ログインしていない場合は早期リターン（Hooks呼び出し後）
  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }

  // エラーハンドリング
  if (workError && !workResp) {
    console.error("Works query error:", workError)
    return <div>作品の読み込みに失敗しました</div>
  }

  if (countError && !worksCountResp) {
    console.error("Works count query error:", countError)
  }

  // ローディング状態
  if (workLoading || countLoading) {
    return <div>読み込み中...</div>
  }

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
        onClickAgeTypeSortButton={props.onClickAgeTypeSortButton}
        onClickTitleSortButton={props.onClickTitleSortButton}
        onClickLikeSortButton={props.onClickLikeSortButton}
        onClickBookmarkSortButton={props.onClickBookmarkSortButton}
        onClickCommentSortButton={props.onClickCommentSortButton}
        onClickViewSortButton={props.onClickViewSortButton}
        onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
        onClickDateSortButton={props.onClickDateSortButton}
        onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
        onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
      />
      {props.isFixedPagination && (
        <>
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              perPage={props.perPage ?? 50}
              maxCount={worksMaxCount}
              currentPage={props.page}
              onPageChange={(page: number) => {
                props.setPage(page)
              }}
            />
          </div>
        </>
      )}
      {!props.isFixedPagination && (
        <div className="mt-4 mb-8">
          <ResponsivePagination
            perPage={props.perPage ?? 50}
            maxCount={worksMaxCount}
            currentPage={props.page}
            onPageChange={(page: number) => {
              props.setPage(page)
            }}
          />
        </div>
      )}
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
