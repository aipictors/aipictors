import { TableRow, TableCell } from "~/components/ui/table"
import { Loader2Icon, TrashIcon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Link } from "react-router"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  folder: FragmentOf<typeof FolderTableRowFragment>
}

/**
 * シリーズ一覧テーブルの項目
 */
export function FoldersListTableRow(props: Props) {
  const [deleteFolder, { loading: isLoadingDeleteFolder }] =
    useMutation(deleteFolderMutation)

  const onDeleteFolder = async (id: string) => {
    await deleteFolder({
      variables: {
        input: {
          folderId: id,
        },
      },
    })
    toast("シリーズを削除しました")
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

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

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
            <Link to={`/collections/${props.folder.nanoid}`}>
              <div className="w-32 overflow-hidden text-ellipsis">
                {truncateTitle(props.folder.title, 32)}
              </div>
            </Link>
          </TableCell>
          <TableCell>
            <Link to={`/collections/${props.folder.nanoid}`}>
              <img
                src={props.folder.thumbnailImageURL ?? undefined}
                alt="thumbnail"
                className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
              />
            </Link>
          </TableCell>
          <TableCell>
            {isLoadingDeleteFolder ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <AppConfirmDialog
                title={"確認"}
                description={`コレクション「${props.folder.title}」を削除しますか？`}
                onNext={async () => {
                  await onDeleteFolder(props.folder.id)
                }}
                onCancel={() => {}}
              >
                <TrashIcon />
              </AppConfirmDialog>
            )}
          </TableCell>
          <TableCell>{toDateTimeText(props.folder.createdAt)}</TableCell>
        </TableRow>
      )}
    </>
  )
}

export const FolderTableRowFragment = graphql(
  `fragment FolderTableRow on FolderNode @_unmask {
    id
    nanoid
    title
    createdAt
    thumbnailImageURL
    userId
    user {
      login
    }
  }`,
)

const deleteFolderMutation = graphql(
  `mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }`,
)
