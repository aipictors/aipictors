import {} from "@/_components/ui/table"
import type { AlbumOrderBy } from "@/_graphql/__generated__/graphql"
import type { SortType } from "@/_types/sort-type"
import { ChevronDown, ChevronUp } from "lucide-react"

type Props = {
  label: string
  orderBy: AlbumOrderBy
  nowOrderBy: AlbumOrderBy
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
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          {props.orderBy === props.nowOrderBy &&
            (props.sort === "ASC" ? <ChevronUp /> : <ChevronDown />)}
        </div>
      </div>
    </>
  )
}
