import { Button } from "~/components/ui/button"
import { FolderIcon, Loader2Icon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  targetWorkId: string
  bookmarkFolderId: string | null
  defaultBookmarked: boolean
}

/**
 * 作品への操作一覧（いいね、フォルダに追加、シェア、メニュー）
 */
export function WorkActionBookmark(props: Props) {
  const [isBookmarked, setIsBookmarked] = useState(props.defaultBookmarked)
  const t = useTranslation()

  const [createFolderWork, { loading: isCreatingFolderWork }] = useMutation(
    createFolderWorkMutation,
  )

  const [deleteFolderWork, { loading: isDeletingFolderWork }] = useMutation(
    deleteFolderWorkMutation,
  )

  const onCreateWorkBookmark = async () => {
    if (props.bookmarkFolderId) {
      setIsBookmarked(!isBookmarked)
      try {
        if (!isBookmarked) {
          await createFolderWork({
            variables: {
              input: {
                folderId: props.bookmarkFolderId,
                workId: props.targetWorkId,
              },
            },
          })
          toast(t("ブックマークに追加しました。", "Added to bookmarks."))
        } else {
          await deleteFolderWork({
            variables: {
              input: {
                folderId: props.bookmarkFolderId,
                workId: props.targetWorkId,
              },
            },
          })

          toast(t("ブックマークから削除しました。", "Removed from bookmarks."))
        }
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message)
        }
      }
    }
  }

  useEffect(() => {
    setIsBookmarked(props.defaultBookmarked)
  }, [props.defaultBookmarked])

  return (
    <Button
      aria-label={t("ブックマークに追加", "Add to bookmarks")}
      size={"icon"}
      variant="secondary"
      onClick={onCreateWorkBookmark}
    >
      {isCreatingFolderWork || isDeletingFolderWork ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <FolderIcon
          className={
            isBookmarked
              ? "fill-black dark:fill-white"
              : "fill-white dark:fill-black"
          }
        />
      )}
    </Button>
  )
}

const createFolderWorkMutation = graphql(
  `mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }`,
)

const deleteFolderWorkMutation = graphql(
  `mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }`,
)
