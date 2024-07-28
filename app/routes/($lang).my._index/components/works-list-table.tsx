import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table"
import { WorksListColumn } from "@/routes/($lang).my._index/components/works-list-column"
import type { SortType } from "@/types/sort-type"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorksListTableRow } from "@/routes/($lang).my._index/components/works-list-table-row"
import type { IntrospectionEnum } from "@/lib/introspection-enum"

type Props = {
  works: {
    id: string
    uuid: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: number
    accessType: IntrospectionEnum<"AccessType">
    workType: IntrospectionEnum<"WorkType">
    isTagEditable: boolean
  }[]
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
}

/**
 * 作品一覧
 */
export const WorksListTable = (props: Props) => {
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
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <WorksListTableRow work={work} key={index} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  )
}
