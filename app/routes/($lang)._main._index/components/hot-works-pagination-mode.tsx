import { useQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import type { ImageStyle, WorkOrderBy, WorkType } from "../types/works"
import { HomeWorkFragment } from "./home-work-section"
import { WorksLoadError } from "./works-load-error"
import { WorksLoading } from "./works-loading"
import { WorksRenderer } from "./works-renderer"

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

export function HotWorksPaginationMode({ anchorAt, onSelect, ...rest }: Props) {
  const { isLoading: authLoading } = useContext(AuthContext)

  const [searchParams] = useSearchParams()
  const urlPage = Number(searchParams.get("page") ?? "0")
  const currentPage = urlPage >= 0 ? urlPage : 0

  useEffect(() => {
    if (rest.setPage && rest.page !== currentPage) {
      rest.setPage(currentPage)
    }
  }, [currentPage, rest.page, rest.setPage])

  const { data, loading, error, refetch } = useQuery(WorksQuery, {
    skip: authLoading,
    variables: {
      where: {
        isSensitive: false,
      },
    },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  })

  useEffect(() => {
    if (rest.updateWorks && data?.hotWorks) {
      rest.updateWorks(
        data.hotWorks as FragmentOf<typeof PhotoAlbumWorkFragment>[],
      )
    }
  }, [data?.hotWorks, rest.updateWorks])

  const displayedWorks = data?.hotWorks ?? []

  return (
    <div className="space-y-4">
      {loading && !displayedWorks.length ? (
        <WorksLoading loading={loading} />
      ) : error && !displayedWorks.length ? (
        <WorksLoadError onRetry={() => refetch()} />
      ) : (
        <WorksRenderer
          workType={rest.workType}
          works={displayedWorks}
          isCropped={rest.isCropped}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

const WorksQuery = graphql(
  `query Works($where:HotWorksWhereInput!) {
     hotWorks(where:$where){
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
