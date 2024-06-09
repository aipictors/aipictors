import { TableRow, TableCell } from "@/_components/ui/table"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"

type Props = {
  work: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }
}

/**
 * 推薦作品一覧テーブルの項目
 */
export const RecommendedWorksListTableRow = (props: Props) => {
  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <a href={`/works/${props.work.id}`}>
            <div className="w-32">{props.work.title}</div>
          </a>
        </TableCell>
        <TableCell>
          <a href={`/works/${props.work.id}`}>
            <img
              src={props.work.thumbnailImageUrl}
              alt="thumbnail"
              className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
            />
          </a>
        </TableCell>
        <TableCell>{props.work.likesCount}</TableCell>
        <TableCell>
          {<div className="w-8">{props.work.bookmarksCount}</div>}
        </TableCell>
        <TableCell>{props.work.commentsCount}</TableCell>
        <TableCell>{props.work.viewsCount}</TableCell>
        <TableCell>{toAccessTypeText(props.work.accessType)}</TableCell>
        <TableCell>{props.work.createdAt}</TableCell>
      </TableRow>
    </>
  )
}
