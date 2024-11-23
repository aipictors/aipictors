import { TableRow, TableCell } from "~/components/ui/table"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { Link } from "react-router";
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  work: FragmentOf<typeof RecommendedWorksTableRowFragment>
}

/**
 * 推薦作品一覧テーブルの項目
 */
export function RecommendedWorksListTableRow(props: Props) {
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <Link to={`/posts/${props.work.id}`}>
            <div className="w-32 overflow-hidden text-ellipsis">
              {truncateTitle(props.work.title, 32)}
            </div>
          </Link>
        </TableCell>
        <TableCell>
          <Link to={`/posts/${props.work.id}`}>
            <img
              src={props.work.smallThumbnailImageURL}
              alt="thumbnail"
              className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
            />
          </Link>
        </TableCell>
        <TableCell>{props.work.likesCount}</TableCell>
        <TableCell>
          {<div className="w-8">{props.work.bookmarksCount}</div>}
        </TableCell>
        <TableCell>{props.work.commentsCount}</TableCell>
        <TableCell>{props.work.viewsCount}</TableCell>
        <TableCell>{toAccessTypeText(props.work.accessType)}</TableCell>
        <TableCell>{toDateTimeText(props.work.createdAt)}</TableCell>
      </TableRow>
    </>
  )
}

export const RecommendedWorksTableRowFragment = graphql(
  `fragment RecommendedWorksTableRow on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    likesCount
    bookmarksCount
    commentsCount
    viewsCount
    accessType
    createdAt
  }`,
)
