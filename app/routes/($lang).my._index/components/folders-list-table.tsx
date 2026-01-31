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
  FoldersListTableRow,
  FolderTableRowFragment,
} from "~/routes/($lang).my._index/components/folders-list-table-row"
import { FoldersListColumn } from "~/routes/($lang).my._index/components/folders-list-column"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  folders: FragmentOf<typeof FolderTableItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"FolderOrderBy">
  onClickTitleSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * シリーズ一覧
 */
export function FoldersListTable (props: Props) {
  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <FoldersListColumn
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
                <FoldersListColumn
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
            {props.folders.map((folder, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Intentional
              <FoldersListTableRow folder={folder} key={index} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}

export const FolderTableItemFragment = graphql(
  `fragment FolderTableItem on FolderNode @_unmask {
    ...FolderTableRow
  }`,
  [FolderTableRowFragment],
)
