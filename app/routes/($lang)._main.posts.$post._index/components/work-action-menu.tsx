import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { ReportDialog } from "~/routes/($lang)._main.posts.$post._index/components/report-dialog"
import { gql, useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { DownloadIcon, MoreHorizontal, SendIcon, ShieldAlert } from "lucide-react"
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
  targetWorkOwnerUserId: string
}

/**
 * 作品のポップオーバーメニュー
 */
export function WorkActionMenu (props: Props) {
  const [changeWorkSettingsWithAdmin, { loading: isUpdatingWork }] =
    useMutation(ChangeWorkSettingsWithAdminMutation)
  const [createMessage, { loading: isSendingMessage }] = useMutation(
    CreateModeratorMessageMutation,
  )
  const [moderatorMessage, setModeratorMessage] = useState("")
  const [isModeratorMessageOpen, setIsModeratorMessageOpen] = useState(false)

  const t = useTranslation()

  const onHideWorkByModerator = async () => {
    try {
      await changeWorkSettingsWithAdmin({
        variables: {
          input: {
            workId: props.postId,
            accessType: "PRIVATE",
          },
        },
      })

      toast(
        t(
          "作品をモデレーター権限で非公開にしました",
          "The work has been hidden by moderator action",
        ),
      )
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("非公開化に失敗しました", "Failed to hide the work"),
      )
    }
  }

  const onSendModeratorMessage = async () => {
    const trimmedMessage = moderatorMessage.trim()
    if (trimmedMessage.length < 5) {
      toast(t("通知内容を入力してください", "Please enter a message"))
      return
    }

    try {
      await createMessage({
        variables: {
          input: {
            recipientId: props.targetWorkOwnerUserId,
            text: trimmedMessage,
          },
        },
      })

      toast(
        t(
          "投稿者に通知を送信しました",
          "A moderator message has been sent to the post owner",
        ),
      )
      setModeratorMessage("")
      setIsModeratorMessageOpen(false)
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("通知送信に失敗しました", "Failed to send the message"),
      )
    }
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
            {isModeratorData?.viewer?.isModerator && (
              <Button
                onClick={onHideWorkByModerator}
                className="flex items-center gap-2"
                variant="outline"
                disabled={isUpdatingWork}
              >
                <ShieldAlert className="size-4" />
                {t("モデレーター: 作品を非公開", "Moderator: Hide work")}
              </Button>
            )}
            {isModeratorData?.viewer?.isModerator && (
              <Button
                onClick={() =>
                  setIsModeratorMessageOpen((previous) => !previous)
                }
                className="flex items-center gap-2"
                variant="outline"
              >
                <SendIcon className="size-4" />
                {t("モデレーター: 投稿者へ通知", "Moderator: Notify owner")}
              </Button>
            )}
            {isModeratorData?.viewer?.isModerator && isModeratorMessageOpen && (
              <div className="space-y-2 rounded-md border p-3">
                <Textarea
                  value={moderatorMessage}
                  onChange={(event) => setModeratorMessage(event.target.value)}
                  placeholder={t(
                    "作品の非公開理由や修正依頼を入力してください",
                    "Enter the reason for hiding the work or a moderator request",
                  )}
                  className="min-h-28 resize-none"
                />
                <Button
                  onClick={onSendModeratorMessage}
                  className="w-full"
                  disabled={isSendingMessage}
                >
                  {t("通知を送信", "Send moderator message")}
                </Button>
              </div>
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

const IsModeratorQuery = graphql(
  `query ViewerIsModerator {
    viewer {
      id
      isModerator
    }
  }`,
)

const ChangeWorkSettingsWithAdminMutation = gql`
  mutation ChangeWorkSettingsWithAdminForMenu($input: WorkSettingsWithAdminInput!) {
    changeWorkSettingsWithAdmin(input: $input)
  }
`

const CreateModeratorMessageMutation = graphql(
  `mutation CreateModeratorMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }`,
)
