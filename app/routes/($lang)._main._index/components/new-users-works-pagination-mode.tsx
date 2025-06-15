// components/WorksPaginationMode.tsx
import { useContext, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { WorksRenderer } from "./works-renderer"
import { WorksLoading } from "./works-loading"
import type { WorkType, WorkOrderBy, ImageStyle } from "../types/works"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { graphql } from "gql.tada"
import { HomeWorkFragment } from "./home-work-section"
import {
  getPerPage,
  makeWhere,
} from "~/routes/($lang)._main._index/utils/works-utils"

interface Props {
  anchorAt: string
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  page?: number
  setPage?: (p: number) => void
}

export function NewUsersWorksPaginationMode({ anchorAt, ...rest }: Props) {
  const PER_PAGE = getPerPage(rest.workType)
  const { isLoading: authLoading } = useContext(AuthContext)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlPage = Number(searchParams.get("page") ?? "0")
  const currentPage = urlPage >= 0 ? urlPage : 0

  /* URL と状態の同期 --------------- */
  useEffect(() => {
    if (rest.setPage && rest.page !== currentPage) {
      rest.setPage(currentPage)
    }
  }, [currentPage, rest.page, rest.setPage])

  /* where 句生成 -------------------- */
  const where = useMemo(() => makeWhere(rest, anchorAt), [rest, anchorAt])

  /* クエリ実行 ---------------------- */
  const { data, loading } = useQuery(NewUserWorksQuery, {
    skip: authLoading,
    variables: {
      offset: currentPage * PER_PAGE,
      limit: PER_PAGE,
      // @ts-ignore - GraphQL type mismatch
      where,
    },
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  })

  const displayedWorks = data?.newUserWorks ?? []

  const handlePageChange = (page: number) => {
    navigate(`?page=${page}`)
    rest.setPage?.(page)
  }

  return (
    <div className="space-y-4">
      {loading && !displayedWorks.length ? (
        <WorksLoading loading={loading} />
      ) : (
        <WorksRenderer
          workType={rest.workType}
          works={displayedWorks}
          isCropped={rest.isCropped}
        />
      )}

      {displayedWorks.length > 0 && (
        <>
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              perPage={PER_PAGE}
              maxCount={1000}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

/* ▼ 新規ユーザ作品クエリ --------------------------------------------- */
export const NewUserWorksQuery = graphql(
  `query NewUserWorks($offset:Int!,$limit:Int!,$where:WorksWhereInput!) {
     newUserWorks(offset:$offset, limit:$limit, where:$where) {
       ...HomeWork
       ...HomeNovelsWorkListItem
       ...HomeVideosWorkListItem
     }
   }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
