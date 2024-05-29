import {} from "@/_components/ui/table"
import type { SortType } from "@/_types/sort-type"
import type { WorksOrderby } from "@/routes/($lang).dashboard._index/_types/works-orderby"
import { ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  label: string
  orderBy: WorksOrderby
  nowOrderBy: WorksOrderby
  sort: SortType
  onClick: () => void
}

/**
 * 作品一覧テーブルのカラム
 */
export const WorksListColumn = (props: Props) => {
  return (
    <>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div onClick={props.onClick} className="cursor-pointer">
        <div className="flex items-center">
          {props.label}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          {props.orderBy === props.nowOrderBy &&
            (props.sort === "ASC" ? <ChevronUp /> : <ChevronDown />)}
        </div>
      </div>
    </>
  )
}
