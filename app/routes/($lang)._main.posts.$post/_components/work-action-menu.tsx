import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { Button } from "@/_components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover"
import { ReportDialog } from "@/routes/($lang)._main.posts.$post/_components/report-dialog"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { DownloadIcon, Loader2Icon, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  onDownload: () => void
  isEnabledDelete: boolean
  postId: string
}

/**
 * 作品への報告、画像ダウンロードのメニュー
 */
export function MenuPopover(props: Props) {
  const [deleteWork, { loading: isLoadingDeleteAlbum }] =
    useMutation(deleteWorkMutation)

  const [isDeleted, setIsDeleted] = useState(false)

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
              ダウンロード
            </Button>
            <ReportDialog />
            {props.isEnabledDelete && (
              <AppConfirmDialog
                title={"確認"}
                description={"本当にこの作品を削除しますか？"}
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
                    <DownloadIcon />
                  )}
                  {isDeleted ? "削除済み" : "削除"}
                </Button>
              </AppConfirmDialog>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const deleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)
