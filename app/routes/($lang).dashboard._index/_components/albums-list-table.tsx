import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/_components/ui/table"
import type { SortType } from "@/_types/sort-type"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AlbumsListTableRow } from "@/routes/($lang).dashboard._index/_components/albums-list-table-row"
import { AlbumsListColumn } from "@/routes/($lang).dashboard._index/_components/albums-list-column"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  albums: {
    id: string
    userId: string
    title: string
    slug: string
    thumbnailImageUrl: string
    createdAt: string
  }[]
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export const AlbumsListTable = (props: Props) => {
  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <AlbumsListColumn
                  label="タイトル"
                  orderBy="NAME"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickTitleSortButton}
                />
              </TableHead>
              <TableHead>{}</TableHead>
              <TableHead>{}</TableHead>
              <TableHead>
                <AlbumsListColumn
                  label="日付"
                  orderBy="DATE_CREATED"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickDateSortButton}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.albums.map((album, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <AlbumsListTableRow album={album} key={index} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}
