import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import {
  MY_COLLECTION_GRID_CLASS,
  MyCollectionCard,
} from "~/routes/($lang).my._index/components/my-collection-card"

type Folder = {
  id: string
  nanoid?: string | null
  title: string
  createdAt: number
  thumbnailImageURL?: string | null
  worksCount?: number | null
}

type Props = {
  folders: Folder[]
  refetch: () => void
}

/**
 * コレクション一覧
 */
export function FoldersList(props: Props) {
  const t = useTranslation()
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null)
  const [deleteFolder, { loading }] = useMutation(deleteFolderMutation)

  const onDelete = async () => {
    if (deletingFolder === null) return
    try {
      await deleteFolder({
        variables: { input: { folderId: deletingFolder.id } },
      })
      toast(t("コレクションを削除しました", "Collection deleted"))
      props.refetch()
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("削除できませんでした", "Could not delete"),
      )
    }
    setDeletingFolder(null)
  }

  return (
    <>
      <ul className={MY_COLLECTION_GRID_CLASS}>
        {props.folders.map((folder) => (
          <MyCollectionCard
            key={folder.id}
            to={`/collections/${folder.nanoid}`}
            title={folder.title}
            thumbnailUrl={folder.thumbnailImageURL}
            worksCount={folder.worksCount}
            createdAt={folder.createdAt}
            onDelete={() => setDeletingFolder(folder)}
          />
        ))}
      </ul>
      <AlertDialog
        open={deletingFolder !== null}
        onOpenChange={(open) => {
          if (!open && !loading) setDeletingFolder(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                `「${deletingFolder?.title}」を削除しますか？`,
                `Delete "${deletingFolder?.title}"?`,
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "コレクションだけを削除します。中の作品は消えません。",
                "Only the collection is deleted. Its works stay.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t("キャンセル", "Cancel")}
            </AlertDialogCancel>
            <Button variant="destructive" disabled={loading} onClick={onDelete}>
              {t("削除する", "Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const FolderListItemFragment = graphql(
  `fragment FolderListItem on FolderNode @_unmask {
    id
    nanoid
    title
    createdAt
    thumbnailImageURL
    worksCount
  }`,
)

const deleteFolderMutation = graphql(
  `mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }`,
)
