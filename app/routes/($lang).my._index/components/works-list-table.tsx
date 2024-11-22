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
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof WorksListTableItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickAgeTypeSortButton: () => void
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
  const t = useTranslation()

  return (
    <>
      <ScrollArea className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <WorksListColumn
                  label={t("タイトル", "Title")}
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
                  label={t("いいね！", "Likes")}
                  orderBy="LIKES_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickLikeSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("ブックマーク", "Bookmarks")}
                  orderBy="BOOKMARKS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickBookmarkSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("コメント", "Comments")}
                  orderBy="COMMENTS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickCommentSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("閲覧", "Views")}
                  orderBy="VIEWS_COUNT"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickViewSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("種別", "Type")}
                  orderBy="WORK_TYPE"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickWorkTypeSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("状態", "Status")}
                  orderBy="ACCESS_TYPE"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickAccessTypeSortButton}
                />
              </TableHead>
              <TableHead>{}</TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("年齢種別", "Age")}
                  orderBy="AGE_TYPE"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickAgeTypeSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("宣伝作品", "Promotion")}
                  orderBy="IS_PROMOTION"
                  nowOrderBy={props.orderBy}
                  sort={props.sort}
                  onClick={props.onClickIsPromotionSortButton}
                />
              </TableHead>
              <TableHead>
                <WorksListColumn
                  label={t("日付", "Date")}
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
