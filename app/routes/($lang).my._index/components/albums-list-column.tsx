import {} from "@/components/ui/table"
import type { IntrospectionEnum } from "@/lib/introspection-enum"
import type { SortType } from "@/types/sort-type"
import { ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  label: string
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  nowOrderBy: IntrospectionEnum<"AlbumOrderBy">
  sort: SortType
  onClick: () => void
}

/**
 * シリーズ一覧テーブルのカラム
 */
export const AlbumsListColumn = (props: Props) => {
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
