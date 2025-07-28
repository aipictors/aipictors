import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { DownloadIcon, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ModerationRatingReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/moderation-rating-report-dialog"
import { ModerationStyleReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/moderation-style-report-dialog"
import { useTranslation } from "~/hooks/use-translation"
import { DeleteWorkConfirmDialog } from "~/routes/($lang)._main.posts.$post._index/components/delete-work-confirm-dialog"

type Props = {
  onDownload: () => void
  onZipDownload: () => void
  disabledZipDownload: boolean
  isEnabledDelete: boolean
  postId: string
}

/**
 * 作品のポップオーバーメニュー
 */
export function WorkActionMenu(props: Props) {
  const [deleteWork, { loading: isLoadingDeleteAlbum }] =
    useMutation(DeleteWorkMutation)
  const [_isDeleted, setIsDeleted] = useState(false)

  const t = useTranslation()

  const _onDeleteWork = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
        },
      },
    })
    toast(
      t(
        "作品を削除しました、しばらくしたらアクセスできなくなります",
        "The post has been deleted",
      ),
    )
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
            {!props.disabledZipDownload && (
              <Button
                onClick={props.onZipDownload}
                className="flex items-center gap-2"
                variant="outline"
              >
                <DownloadIcon />
                {t("一括ダウンロード", "All Download")}
              </Button>
            )}
            <ReportDialog postId={props.postId} />
            {isModeratorData?.viewer?.isModerator && (
              <ModerationRatingReportDialog postId={props.postId} />
            )}
            {isModeratorData?.viewer?.isModerator && (
              <ModerationStyleReportDialog postId={props.postId} />
            )}
            {props.isEnabledDelete && (
              <DeleteWorkConfirmDialog postId={props.postId} />
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
      id
      isModerator
    }
  }`,
)
