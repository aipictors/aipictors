import { useContext, useEffect } from "react"
import { useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { WorksRenderer } from "./works-renderer"
import { WorksLoading } from "./works-loading"
import type { WorkType, WorkOrderBy, ImageStyle } from "../types/works"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { type FragmentOf, graphql } from "gql.tada"
import { HomeWorkFragment } from "./home-work-section"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

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
  onSelect?: (index: number) => void
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

  const { data, loading } = useQuery(WorksQuery, {
    skip: authLoading,
    variables: {
      where: {
        isSensitive: false,
      },
    },
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
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

export const WorksQuery = graphql(
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
