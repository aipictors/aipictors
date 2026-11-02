import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { MessageCircleIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { useTranslation } from "~/hooks/use-translation"

const STATUS_MAX_LENGTH = 60

const SWITCH_ID = "user-status-visible"

type Props = {
  /** 他の人に見えているステータス */
  statusText: string | null
  isOwn: boolean
}

const STATUS_CLASS_NAME =
  "inline-flex max-w-full items-start gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-3 py-1.5 text-left text-sm"

/**
 * プロフィールのひとことステータス。本人は押して変えられる
 */
export function UserProfileStatus(props: Props) {
  if (props.isOwn) {
    return <OwnUserProfileStatus statusText={props.statusText} />
  }
  if (props.statusText === null) {
    return null
  }
  return (
    <p className={STATUS_CLASS_NAME}>
      <MessageCircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 break-words">{props.statusText}</span>
    </p>
  )
}

function OwnUserProfileStatus(props: { statusText: string | null }) {
  const t = useTranslation()
  const { data } = useQuery(viewerUserStatusQuery)
  const [isOpen, setIsOpen] = useState(false)

  const text = data?.viewerUserStatus?.text ?? props.statusText ?? ""
  const isVisible = data?.viewerUserStatus?.isVisible ?? true

  return (
    <>
      <button
        type="button"
        className={`${STATUS_CLASS_NAME} transition-colors hover:bg-muted/70`}
        onClick={() => setIsOpen(true)}
      >
        {text.length > 0 ? (
          <>
            <MessageCircleIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span
              className={`min-w-0 break-words ${isVisible ? "" : "text-muted-foreground line-through"}`}
            >
              {text}
            </span>
            {!isVisible && (
              <span className="shrink-0 text-muted-foreground text-xs leading-5">
                {t("非表示", "Hidden")}
              </span>
            )}
          </>
        ) : (
          <>
            <PlusIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("ステータスを設定", "Set a status")}
            </span>
          </>
        )}
      </button>
      {isOpen && (
        <UserStatusDialog
          text={text}
          isVisible={isVisible}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

function UserStatusDialog(props: {
  text: string
  isVisible: boolean
  onClose: () => void
}) {
  const t = useTranslation()
  const [text, setText] = useState(props.text)
  const [isVisible, setIsVisible] = useState(props.isVisible)
  const [updateStatus, { loading }] = useMutation(updateUserStatusMutation, {
    refetchQueries: [viewerUserStatusQuery],
    awaitRefetchQueries: true,
  })

  const length = Array.from(text.trim()).length
  const isTooLong = length > STATUS_MAX_LENGTH

  const save = async (nextText: string) => {
    try {
      await updateStatus({
        variables: { input: { text: nextText, isVisible } },
      })
      toast(t("ステータスを更新しました", "Status updated"))
      props.onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("更新できませんでした", "Could not update"),
      )
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ステータス", "Status")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Input
              aria-label={t("ステータス", "Status")}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={t(
                "例: 今週は忙しいので投稿をお休みします",
                "e.g. Taking a break from posting this week",
              )}
            />
            <p
              className={`text-right text-xs ${isTooLong ? "text-destructive" : "text-muted-foreground"}`}
            >
              {length} / {STATUS_MAX_LENGTH}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={SWITCH_ID} className="cursor-pointer text-sm">
              {t("プロフィールに表示する", "Show on my profile")}
            </label>
            <Switch
              id={SWITCH_ID}
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
          </div>
          <div className="flex justify-end gap-2">
            {props.text.length > 0 && (
              <Button
                variant="ghost"
                disabled={loading}
                onClick={() => save("")}
              >
                {t("消す", "Clear")}
              </Button>
            )}
            <Button disabled={loading || isTooLong} onClick={() => save(text)}>
              {t("保存", "Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const viewerUserStatusQuery = graphql(
  `query ViewerUserStatus {
    viewerUserStatus {
      text
      isVisible
    }
  }`,
)

const updateUserStatusMutation = graphql(
  `mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
    updateUserStatus(input: $input) {
      text
      isVisible
    }
  }`,
)
