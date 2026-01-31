import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/ui/table"
import type { SortType } from "~/types/sort-type"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  AlbumsListTableRow,
  AlbumTableRowFragment,
} from "~/routes/($lang).my._index/components/albums-list-table-row"
import { AlbumsListColumn } from "~/routes/($lang).my._index/components/albums-list-column"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  albums: FragmentOf<typeof AlbumTableItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export function AlbumsListTable (props: Props) {
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
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              <AlbumsListTableRow album={album} key={index} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}

export const AlbumTableItemFragment = graphql(
  `fragment AlbumTableItem on AlbumNode @_unmask {
    ...AlbumTableRow
  }`,
  [AlbumTableRowFragment],
)
