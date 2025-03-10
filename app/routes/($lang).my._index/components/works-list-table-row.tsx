import { TableRow, TableCell } from "~/components/ui/table"
import { Loader2Icon, PencilIcon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { Link } from "@remix-run/react"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { type FragmentOf, graphql } from "gql.tada"
import { useLocale } from "~/hooks/use-locale"
import { DeleteWorkConfirmDialog } from "~/routes/($lang).my._index/components/delete-work-confirm-dialog"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  work: FragmentOf<typeof WorksListTableRowFragment>
}

/**
 * 作品一覧テーブルの項目
 */
export function WorksListTableRow(props: Props) {
  const [deleteWork, { loading: isLoadingDeleteWork }] =
    useMutation(deleteWorkMutation)

  const onDeleteWork = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
        },
      },
    })
    toast("作品を削除しました、しばらくしたらアクセスできなくなります")
    setIsDeleted(true)
  }

  const [isDeleted, setIsDeleted] = useState(false)

  // isDeletedがtrueになったら、0.5秒後に非表示にする
  useEffect(() => {
    if (isDeleted) {
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, 140)
      return () => clearTimeout(timer)
    }
  }, [isDeleted])

  const [isHidden, setIsHidden] = useState(false)

  const editUrl = () => {
    if (props.work.type === "WORK") {
      return `/posts/${props.work.id}/image/edit`
    }
    if (props.work.type === "VIDEO") {
      return `/posts/${props.work.id}/animation/edit`
    }
    if (props.work.type === "COLUMN" || props.work.type === "NOVEL") {
      return `/posts/${props.work.id}/text/edit`
    }
    return "/"
  }

  const postUrl = () => {
    if (
      new Date(props.work.createdAt * 1000).getTime() > new Date().getTime() ||
      props.work.accessType === "PRIVATE" ||
      props.work.accessType === "DRAFT"
    ) {
      return `/posts/${props.work.id}/draft`
    }
    if (props.work.accessType === "LIMITED") {
      return `/posts/${props.work.uuid}`
    }
    return `/posts/${props.work.id}`
  }

  const location = useLocale()

  return (
    <>
      {!isHidden && (
        <TableRow
          style={{
            opacity: isDeleted ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}
        >
          <TableCell className="font-medium">
            {new Date(props.work.createdAt * 1000).getTime() >
            new Date().getTime() ? (
              <div className="w-32 overflow-hidden text-ellipsis">
                {props.work.title}
              </div>
            ) : (
              <Link to={postUrl()}>
                <div className="w-32 overflow-hidden text-ellipsis">
                  {props.work.title}
                </div>
              </Link>
            )}
          </TableCell>
          <TableCell>
            <Link to={postUrl()}>
              <img
                src={props.work.smallThumbnailImageURL}
                alt="thumbnail"
                className="h-[80px] w-[80px] min-w-[80px] cursor-pointer rounded-md object-cover"
              />{" "}
            </Link>
          </TableCell>
          <TableCell>
            <Link to={editUrl()}>
              <PencilIcon />
            </Link>
          </TableCell>
          <TableCell>{props.work.likesCount}</TableCell>
          <TableCell>
            {<div className="w-8">{props.work.bookmarksCount}</div>}
          </TableCell>
          <TableCell>{props.work.commentsCount}</TableCell>
          <TableCell>{props.work.viewsCount}</TableCell>
          <TableCell>
            {toWorkTypeText({
              type: props.work.type,
              lang: location,
            })}
          </TableCell>
          <TableCell>{toAccessTypeText(props.work.accessType)}</TableCell>
          <TableCell>
            {isLoadingDeleteWork ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <DeleteWorkConfirmDialog
                onDelete={async () => {
                  await onDeleteWork(props.work.id)
                }}
                workTitle={props.work.title}
              />
            )}
          </TableCell>
          <TableCell>{toRatingText(props.work.rating ?? "G")}</TableCell>
          <TableCell>{props.work.isPromotion ? "○" : ""}</TableCell>
          <TableCell>{toDateTimeText(props.work.createdAt)}</TableCell>
        </TableRow>
      )}
    </>
  )
}

export const WorksListTableRowFragment = graphql(
  `fragment WorksListTableRow on WorkNode @_unmask {
    id
    uuid
    title
    type
    createdAt
    accessType
    smallThumbnailImageURL
    likesCount
    bookmarksCount
    commentsCount
    viewsCount
    rating
    isPromotion
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    thumbnailImagePosition
  }`,
)

const deleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
      isDeleted
    }
  }`,
)
