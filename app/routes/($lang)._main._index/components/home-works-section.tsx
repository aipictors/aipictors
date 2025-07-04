import { useMemo } from "react"
import { WorksPaginationMode } from "./works-pagination-mode"
import { WorksInfiniteMode } from "./works-infinite-mode"
import type { WorkType, WorkOrderBy, ImageStyle } from "../types/works"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"

interface Props {
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  page?: number
  setPage?: (p: number) => void
  isPagination?: boolean
  onPaginationModeChange?: (isPagination: boolean) => void
  onSelect?: (index: string) => void
  updateWorks: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

export function HomeWorksSection(props: Props) {
  const anchorAt = useMemo(() => getAnchorAt(), [])
  const key = `${props.timeRange}-${props.workType}-${props.sortType}-${props.isPagination}`

  return (
    <div className="space-y-4">
      {props.isPagination ? (
        <WorksPaginationMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={props.updateWorks}
        />
      ) : (
        <WorksInfiniteMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={props.updateWorks}
        />
      )}
    </div>
  )
}
