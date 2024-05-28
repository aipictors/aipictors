import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/_components/ui/table"
import type { WorkAccessType } from "@/_types/work-access-type"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import { WorksListColumn } from "@/routes/($lang).dashboard._index/_components/works-list-column"
import type { SortType } from "@/routes/($lang).dashboard._index/_types/sort-type"
import type { WorksOrderby } from "@/routes/($lang).dashboard._index/_types/works-orderby"
import { PencilIcon } from "lucide-react"

type Props = {
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    accessType: WorkAccessType
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: WorksOrderby
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * 作品一覧
 */
export const WorksList = (props: Props) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
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
            <TableHead>状態</TableHead>
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
            <TableRow key={index}>
              <TableCell className="font-medium">
                <a href={`/works/${work.id}`}>
                  <div className="w-32">{work.title}</div>
                </a>
              </TableCell>
              <TableCell>
                <a href={`/works/${work.id}`}>
                  <img
                    src={work.thumbnailImageUrl}
                    alt=""
                    className="h-[80px] w-[80px] rounded-md object-cover"
                  />
                </a>
              </TableCell>
              <TableCell>
                <a href={`https://aipictors.com/edit-work/?id=${work.id}`}>
                  <PencilIcon />
                </a>
              </TableCell>
              <TableCell>{work.likesCount}</TableCell>
              <TableCell>
                {<div className="w-8">{work.bookmarksCount}</div>}
              </TableCell>
              <TableCell>{work.commentsCount}</TableCell>
              <TableCell>{work.viewsCount}</TableCell>
              <TableCell>{toAccessTypeText(work.accessType)}</TableCell>
              <TableCell>{work.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
