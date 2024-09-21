import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { DownloadIcon, Loader2Icon, MoreHorizontal, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ModerationRatingReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/moderation-rating-report-dialog"
import { ModerationStyleReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/moderation-style-report-dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  onDownload: () => void
  isEnabledDelete: boolean
  postId: string
}

/**
 * Menu for reporting a post and downloading an image
 */
export function MenuPopover(props: Props) {
  const [deleteWork, { loading: isLoadingDeleteAlbum }] =
    useMutation(DeleteWorkMutation)
  const [isDeleted, setIsDeleted] = useState(false)

  const t = useTranslation()

  const onDeleteWork = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
        },
      },
    })
    toast(t("作品を削除しました", "The post has been deleted"))
    setIsDeleted(true)
  }

  const { data: isModeratorData } = useQuery(IsModeratorQuery, {})

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button
              onClick={props.onDownload}
              className="flex items-center gap-2"
              variant="outline"
            >
              <DownloadIcon />
              {t("ダウンロード", "Download")}
            </Button>
            <ReportDialog postId={props.postId} />
            {isModeratorData?.viewer?.isModerator && (
              <ModerationRatingReportDialog postId={props.postId} />
            )}
            {isModeratorData?.viewer?.isModerator && (
              <ModerationStyleReportDialog postId={props.postId} />
            )}
            {props.isEnabledDelete && (
              <AppConfirmDialog
                title={t("確認", "Confirm")}
                description={t(
                  "本当にこの作品を削除しますか？",
                  "Are you sure you want to delete this post?",
                )}
                onNext={async () => {
                  await onDeleteWork(props.postId)
                }}
                onCancel={() => {}}
              >
                <Button
                  className="flex items-center gap-2"
                  variant={"destructive"}
                  disabled={isDeleted}
                >
                  {isLoadingDeleteAlbum ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <Trash />
                  )}
                  {isDeleted ? t("削除済み", "Deleted") : t("削除", "Delete")}
                </Button>
              </AppConfirmDialog>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const DeleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)

const IsModeratorQuery = graphql(
  `query ViewerIsModerator {
    viewer {
      isModerator
    }
  }`,
)
