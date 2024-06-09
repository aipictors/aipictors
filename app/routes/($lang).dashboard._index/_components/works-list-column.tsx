import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  label: string
  orderBy: IntrospectionEnum<"WorkOrderBy">
  nowOrderBy: IntrospectionEnum<"WorkOrderBy">
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
          {props.orderBy === props.nowOrderBy &&
            (props.sort === "ASC" ? <ChevronUp /> : <ChevronDown />)}
        </div>
      </div>
    </>
  )
}
