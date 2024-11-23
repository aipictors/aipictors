import { Separator } from "~/components/ui/separator"
import { Loader2Icon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Link } from "react-router";
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { DeleteFolderConfirmDialog } from "~/routes/($lang).my._index/components/delete-folder-confirm-dialog"

type Props = {
  folder: FragmentOf<typeof MobileFolderListItemFragment>
}

/**
 * スマホ向けシリーズ一覧のアイテム
 */
export function FoldersSpListItem(props: Props) {
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

  return (
    <>
      {!isHidden && (
        <>
          <div
            className="mt-2 mb-2 flex"
            style={{
              opacity: isDeleted ? 0 : 1,
              transition: "opacity 1s ease-out",
            }}
          >
            <Link
              to={`/${props.folder.userId}/folders/${props.folder.id}`}
              className="mr-2"
            >
              <img
                src={props.folder.thumbnailImageURL ?? undefined}
                alt=""
                className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
              />
            </Link>
            <div className="w-full space-y-2">
              <div className="w-full space-y-2">
                <Link to={`/${props.folder.userId}/folders/${props.folder.id}`}>
                  <div className="w-full font-bold">{props.folder.title}</div>
                </Link>
                <div className="text-sm opacity-80">
                  {toDateTimeText(props.folder.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex w-16 justify-center">
              {isLoadingDeleteFolder ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <DeleteFolderConfirmDialog
                  onDelete={async () => {
                    await onDeleteFolder(props.folder.id)
                  }}
                  folderTitle={props.folder.title}
                />
              )}
            </div>
          </div>
          <Separator />
        </>
      )}
    </>
  )
}

export const MobileFolderListItemFragment = graphql(
  `fragment MobileFolderListItem on FolderNode @_unmask {
    id
    nanoid
    title
    createdAt
    userId
    thumbnailImageURL
  }`,
)

const deleteFolderMutation = graphql(
  `mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }`,
)
