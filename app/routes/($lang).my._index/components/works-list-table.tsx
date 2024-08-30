import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/ui/table"
import { WorksListColumn } from "~/routes/($lang).my._index/components/works-list-column"
import type { SortType } from "~/types/sort-type"
import { ScrollArea } from "~/components/ui/scroll-area"
import {
  WorksListTableRow,
  WorksListTableRowFragment,
} from "~/routes/($lang).my._index/components/works-list-table-row"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof WorksListTableItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

/**
 * 作品一覧
 */
export function WorksListTable(props: Props) {
  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <WorksListColumn
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
                <WorksListColumn
                  label="いいね！"
                  orderBy="LIKES_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickLikeSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label="ブックマーク"
                  orderBy="BOOKMARKS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickBookmarkSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label="コメント"
                  orderBy="COMMENTS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickCommentSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label="閲覧"
                  orderBy="VIEWS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickViewSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label="種別"
                  orderBy="WORK_TYPE"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickWorkTypeSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label="状態"
                  orderBy="ACCESS_TYPE"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickAccessTypeSortButton}
                />
              </TableHead>
              <TableHead>{}</TableHead>
              <TableHead>
                <WorksListColumn
                  label="宣伝作品"
                  orderBy="IS_PROMOTION"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickIsPromotionSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
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
            {props.works.map((work, index) => (
              <WorksListTableRow work={work} key={work.id} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}

export const WorksListTableItemFragment = graphql(
  `fragment WorksListTableItem on WorkNode @_unmask {
    ...WorksListTableRow
  }`,
  [WorksListTableRowFragment],
)
