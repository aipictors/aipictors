import { Button } from "~/components/ui/button"
import { FolderIcon, Loader2Icon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useContext, useEffect, useState } from "react"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"

type Props = {
  targetWorkId: string
  bookmarkFolderId: string | null
  defaultBookmarked: boolean
}

/**
 * 作品をブックマーク（ブックマークのコレクション）に追加・削除するボタン
 * 以前は未ログインだと押しても何も起きず、失敗しても印だけ切り替わったままになっていた
 */
export function WorkActionBookmark(props: Props) {
  const [isBookmarked, setIsBookmarked] = useState(props.defaultBookmarked)
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [createFolderWork, { loading: isCreatingFolderWork }] = useMutation(
    createFolderWorkMutation,
  )

  const [deleteFolderWork, { loading: isDeletingFolderWork }] = useMutation(
    deleteFolderWorkMutation,
  )

  const isLoading = isCreatingFolderWork || isDeletingFolderWork

  const onToggleBookmark = async () => {
    if (!props.bookmarkFolderId || isLoading) {
      return
    }
    const next = !isBookmarked
    setIsBookmarked(next)
    const input = {
      folderId: props.bookmarkFolderId,
      workId: props.targetWorkId,
    }
    try {
      if (next) {
        await createFolderWork({ variables: { input } })
        toast(t("ブックマークに追加しました。", "Added to bookmarks."))
      } else {
        await deleteFolderWork({ variables: { input } })
        toast(t("ブックマークから削除しました。", "Removed from bookmarks."))
      }
    } catch (error) {
      setIsBookmarked(!next)
      toast(
        error instanceof Error
          ? error.message
          : t("ブックマークを変更できませんでした", "Could not update bookmarks"),
      )
    }
  }

  useEffect(() => {
    setIsBookmarked(props.defaultBookmarked)
  }, [props.defaultBookmarked])

  const label = isBookmarked
    ? t("ブックマークから削除", "Remove from bookmarks")
    : t("ブックマークに追加", "Add to bookmarks")

  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label={t("ブックマーク", "Bookmark")}
        isLoading={authContext.isLoading}
        description={t(
          "ログインして、好きな作品をブックマークしましょう！",
          "Log in to bookmark your favorite works!",
        )}
        triggerChildren={
          <div
            role="button"
            aria-label={label}
            title={label}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <FolderIcon className="size-4" />
          </div>
        }
      />
    )
  }

  return (
    <Button
      aria-label={label}
      aria-pressed={isBookmarked}
      title={label}
      size={"icon"}
      variant="secondary"
      disabled={isLoading || !props.bookmarkFolderId}
      onClick={onToggleBookmark}
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
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
