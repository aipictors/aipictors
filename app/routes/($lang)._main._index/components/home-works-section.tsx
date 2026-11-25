import type { FragmentOf } from "gql.tada"
import { useMemo } from "react"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useHomeOriginalOnly } from "~/routes/($lang)._main._index/hooks/use-original-only"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"
import type { ImageStyle, WorkOrderBy, WorkType } from "../types/works"
import { WorksInfiniteMode } from "./works-infinite-mode"
import { WorksPaginationMode } from "./works-pagination-mode"

interface Props {
  isCropped?: boolean
  workType: WorkType | null
  isPromptPublic: boolean | null
  sortType: WorkOrderBy | null
  timeRange?: string
  style?: ImageStyle
  page?: number
  setPage?: (p: number) => void
  onPageChange?: (p: number) => void
  isPagination?: boolean
  onPaginationModeChange?: (isPagination: boolean) => void
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
  updateWorks?: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
  isOneWorkPerUser?: boolean
}

export function HomeWorksSection(props: Props) {
  const anchorAt = useMemo(() => getAnchorAt(), [])
  const { isOriginalOnly } = useHomeOriginalOnly()
  const key = `${props.timeRange}-${props.workType}-${props.sortType}-${props.isPagination}-${isOriginalOnly}`
  const updateWorks = props.updateWorks ?? (() => {})

  return (
    <div className="space-y-4">
      {props.isPagination ? (
        <WorksPaginationMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={updateWorks}
        />
      ) : (
        <WorksInfiniteMode
          key={key}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          updateWorks={updateWorks}
        />
      )}
    </div>
  )
}
