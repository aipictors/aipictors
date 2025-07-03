import { useMemo } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { WorksInfiniteMode } from "./works-infinite-mode"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"
import { WorksPaginationMode } from "~/routes/($lang)._main._index/components/works-pagination-mode"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { FragmentOf } from "gql.tada"

type Props = {
  isCropped?: boolean
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  style?: IntrospectionEnum<"ImageStyle">
  isPagination?: boolean
  onPaginationModeChange?: (isPagination: boolean) => void
  onSelect?: (index: number) => void
  updateWorks: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

export function HomeHotWorksSection(props: Props) {
  const anchorAt = useMemo(() => getAnchorAt(), [])
  const key = `hot-${props.workType}-${props.sortType}-${props.isPagination}`

  // 人気作品用の特別なprops
  const hotWorksProps = {
    ...props,
    sortType: "LIKES_COUNT" as IntrospectionEnum<"WorkOrderBy">, // 人気順固定
    timeRange: "WEEK" as string, // 週間人気
  }

  return (
    <div className="space-y-4">
      {props.isPagination ? (
        <WorksPaginationMode
          key={key}
          {...hotWorksProps}
          anchorAt={anchorAt}
          updateWorks={props.updateWorks}
        />
      ) : (
        <WorksInfiniteMode
          key={key}
          {...hotWorksProps}
          anchorAt={anchorAt}
          updateWorks={props.updateWorks}
        />
      )}
    </div>
  )
}
