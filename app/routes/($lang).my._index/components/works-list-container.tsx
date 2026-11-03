import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useMemo } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import {
  type MyWork,
  MyWorkListItemFragment,
} from "~/routes/($lang).my._index/components/my-work-items"
import { WorksList } from "~/routes/($lang).my._index/components/works-list"
import type { SortType } from "~/types/sort-type"

type Props = {
  page: number
  perPage: number
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  search: string
  isFiltered: boolean
  onClearFilters: () => void
  setPage: (page: number) => void
  onSort: (orderBy: IntrospectionEnum<"WorkOrderBy">, sort: SortType) => void
}

/**
 * 作品一覧コンテナ
 */
export function WorksListContainer(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  // 一覧と件数は同じ条件で数える（予約投稿の分だけ件数が合わないことがあった）
  const where = useMemo(
    () => ({
      userId: authContext.userId || "",
      orderBy: props.orderBy,
      sort: props.sort,
      isIncludePrivate: true,
      ...(props.accessType !== null && { accessTypes: [props.accessType] }),
      ...(props.workType !== null && { workTypes: [props.workType] }),
      ratings: (props.rating !== null
        ? [props.rating]
        : ["G", "R15", "R18", "R18G"]) as ("G" | "R15" | "R18" | "R18G")[],
      ...(props.search.length > 0 && {
        search: props.search,
        searchInTags: true,
        searchInDescription: true,
      }),
      createdAtAfter: new Date("1999/01/01").toISOString(),
      beforeCreatedAt: new Date("2099/01/01").toISOString(),
    }),
    [
      authContext.userId,
      props.orderBy,
      props.sort,
      props.accessType,
      props.workType,
      props.rating,
      props.search,
    ],
  )

  const skip =
    authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId

  const { data, previousData, loading, error, refetch } = useQuery(worksQuery, {
    skip,
    variables: {
      offset: props.perPage * props.page,
      limit: props.perPage,
      where,
    },
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  const { data: countData, previousData: previousCountData } = useQuery(
    worksCountQuery,
    {
      skip,
      variables: { where },
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
    },
  )

  const worksCount = countData?.worksCount ?? previousCountData?.worksCount ?? 0

  // ページを移っても前の一覧を残して薄くする（毎回スピナーに置き換えると、位置が飛んで見失う）
  const works = (data?.works ?? previousData?.works) as MyWork[] | undefined
  const lastPage = Math.max(Math.ceil(worksCount / props.perPage) - 1, 0)

  // 作品を消したあとなどで今のページがなくなったら、最後のページへ戻す
  useEffect(() => {
    if (countData?.worksCount !== undefined && props.page > lastPage) {
      props.setPage(lastPage)
    }
  }, [countData?.worksCount, lastPage, props])

  if (skip) {
    return authContext.isLoading ? <ListSkeleton /> : null
  }

  if (error && works === undefined) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
        <p className="font-medium">
          {t("作品を読み込めませんでした", "Could not load your works")}
        </p>
        <p className="text-muted-foreground text-sm">
          {t(
            "混み合っている可能性があります。少し待ってからお試しください。",
            "The site may be busy. Please try again shortly.",
          )}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          {t("もう一度読み込む", "Retry")}
        </Button>
      </div>
    )
  }

  if (works === undefined) {
    return <ListSkeleton />
  }

  return (
    <>
      <div
        aria-busy={loading}
        className={cn(
          "space-y-3 transition-opacity",
          loading && "pointer-events-none opacity-60",
        )}
      >
        <WorksList
          key={authContext.userId}
          works={works}
          worksCount={worksCount}
          isFiltered={props.isFiltered}
          onClearFilters={props.onClearFilters}
          sort={props.sort}
          orderBy={props.orderBy}
          onSort={props.onSort}
        />
      </div>
      {worksCount > props.perPage && (
        // 一覧の範囲でだけ画面の下に固定する（フッターに重ならない）
        <div className="sticky bottom-0 z-10 mt-3 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={props.perPage}
            maxCount={worksCount}
            currentPage={props.page}
            onPageChange={(page: number) => {
              props.setPage(page)
              window.scrollTo({ top: 0 })
            }}
          />
        </div>
      )}
    </>
  )
}

function ListSkeleton() {
  return (
    <div aria-hidden className="divide-y rounded-xl border">
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 p-2.5"
        >
          <div className="size-14 shrink-0 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
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
      ...MyWorkListItem
    }
  }`,
  [MyWorkListItemFragment],
)
