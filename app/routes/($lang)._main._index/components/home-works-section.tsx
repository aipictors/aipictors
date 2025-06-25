import { useEffect, useMemo, useState } from "react"
import { WorksPaginationMode } from "./works-pagination-mode"
import { WorksInfiniteMode } from "./works-infinite-mode"
import type {
  WorkType,
  WorkOrderBy,
  ImageStyle,
  WorkItem,
} from "../types/works"
import { getAnchorAt } from "~/routes/($lang)._main._index/libs/anchor-manager"

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
  onSelect?: (index: number) => void
  onWorksLoaded?: (works: WorkItem[]) => void
  initialWorks?: WorkItem[] // SSRで取得した初期データ
}

export function HomeWorksSection(props: Props) {
  const anchorAt = useMemo(() => getAnchorAt(), [])
  // props変更を検知するためのキー
  const contentKey = useMemo(() => {
    return `${props.timeRange}-${props.workType}-${props.sortType}-${props.isPagination}-${Date.now()}`
  }, [props.timeRange, props.workType, props.sortType, props.isPagination])

  // モード変更時やprops変更時にコンテンツをリセットするための内部状態
  const [resetKey, setResetKey] = useState(Date.now())

  // propsの変更を検知してresetKeyを更新
  useEffect(() => {
    console.log("HomeWorksSection props changed, resetting component")
    setResetKey(Date.now())
    // スクロール位置をリセット
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [props.timeRange, props.workType, props.sortType, props.isPagination])

  return (
    <div className="space-y-4">
      {props.isPagination ? (
        <WorksPaginationMode
          key={`pagination-${contentKey}-${resetKey}`}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
        />
      ) : (
        <WorksInfiniteMode
          key={`infinite-${contentKey}-${resetKey}`}
          {...props}
          anchorAt={anchorAt}
          onSelect={props.onSelect}
          onWorksLoaded={props.onWorksLoaded}
          initialWorks={props.initialWorks}
        />
      )}
    </div>
  )
}
