import { useContext, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { type FragmentOf, graphql } from "gql.tada"
import {
  getPerPage,
  makeWhere,
} from "~/routes/($lang)._main._index/utils/works-utils"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type {
  ImageStyle,
  WorkOrderBy,
  WorkType,
} from "~/routes/($lang)._main._index/types/works"
import { WorksRenderer } from "~/routes/($lang)._main._index/components/works-renderer"
import { WorksLoading } from "~/routes/($lang)._main._index/components/works-loading"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"

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
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

export function SensitiveWorksPaginationMode ({
  anchorAt,
  onSelect,
  ...rest
}: Props) {
  const PER_PAGE = getPerPage(rest.workType)
  const { isLoading: authLoading } = useContext(AuthContext)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlPage = Number(searchParams.get("page") ?? "0")
  const currentPage = urlPage >= 0 ? urlPage : 0

  useEffect(() => {
    if (rest.setPage && rest.page !== currentPage) {
      rest.setPage(currentPage)
    }
  }, [currentPage, rest.page, rest.setPage])

  const where = useMemo(
    () => makeWhere(rest, anchorAt, ["R18", "R18G"]),
    [rest, anchorAt],
  )

  const { data, loading } = useQuery(WorksQuery, {
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

  useEffect(() => {
    if (rest.updateWorks && data?.works) {
      rest.updateWorks(
        data.works as FragmentOf<typeof PhotoAlbumWorkFragment>[],
      )
    }
  }, [data?.works, rest.updateWorks])

  const displayedWorks = data?.works ?? []

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
          onSelect={onSelect}
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

export const WorksQuery = graphql(
  `query Works($offset:Int!,$limit:Int!,$where:WorksWhereInput!) {
     works(offset:$offset,limit:$limit,where:$where){
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
