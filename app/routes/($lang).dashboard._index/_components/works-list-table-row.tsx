import { TableRow, TableCell } from "@/_components/ui/table"
import { Loader2Icon, PencilIcon, TrashIcon } from "lucide-react"
import { deleteWorkMutation } from "@/_graphql/mutations/delete-work"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { Link } from "@remix-run/react"

type Props = {
  work: {
    id: string
    uuid: string
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
 * 作品一覧テーブルの項目
 */
export const WorksListTableRow = (props: Props) => {
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
    toast("作品を削除しました")
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
            {props.work.accessType === "LIMITED" ? (
              <Link to={`/works/${props.work.uuid}`}>
                <div className="w-32">{props.work.title}</div>
              </Link>
            ) : (
              <Link to={`/works/${props.work.id}`}>
                <div className="w-32">{props.work.title}</div>
              </Link>
            )}
          </TableCell>
          <TableCell>
            {props.work.accessType === "LIMITED" ? (
              <Link to={`/works/${props.work.uuid}`}>
                <img
                  src={props.work.thumbnailImageUrl}
                  alt="thumbnail"
                  className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
                />{" "}
              </Link>
            ) : (
              <Link to={`/works/${props.work.id}`}>
                <img
                  src={props.work.thumbnailImageUrl}
                  alt="thumbnail"
                  className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
                />{" "}
              </Link>
            )}
          </TableCell>
          <TableCell>
            <Link to={`/works/${props.work.id}/edit`}>
              <PencilIcon />
            </Link>
          </TableCell>
          <TableCell>{props.work.likesCount}</TableCell>
          <TableCell>
            {<div className="w-8">{props.work.bookmarksCount}</div>}
          </TableCell>
          <TableCell>{props.work.commentsCount}</TableCell>
          <TableCell>{props.work.viewsCount}</TableCell>
          <TableCell>{toAccessTypeText(props.work.accessType)}</TableCell>
          <TableCell>
            {isLoadingDeleteWork ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <AppConfirmDialog
                title={"確認"}
                description={`作品「${props.work.title}」を削除しますか？`}
                onNext={async () => {
                  await onDeleteWork(props.work.id)
                }}
                onCancel={() => {}}
              >
                <TrashIcon />
              </AppConfirmDialog>
            )}
          </TableCell>
          <TableCell>{props.work.createdAt}</TableCell>
        </TableRow>
      )}
    </>
  )
}
