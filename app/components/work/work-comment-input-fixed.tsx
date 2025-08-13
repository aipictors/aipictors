import { useContext, useState } from "react"
import { useMutation, useQuery } from "@apollo/client/index"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { StickerDialog } from "~/components/work/sticker-dialog"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useBoolean } from "usehooks-ts"
import { Loader2Icon, MessageCircle, StampIcon } from "lucide-react"

type Props = {
  workId: string
  isWorkOwnerBlocked?: boolean
  commentsCount: number
  onCommentAdded?: () => void
}

/**
 * 固定コメント入力欄コンポーネント
 */
export function WorkCommentInputFixed(props: Props) {
  const authContext = useContext(AuthContext)
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const t = useTranslation()

  const [comment, setComment] = useState("")
  const [isSensitive, setIsSensitive] = useState(false)

  const [createWorkComment, { loading: isCreatingWorkComment }] = useMutation(
    createWorkCommentMutation,
  )

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId ?? "0",
    },
  })

  const userIcon = userResp?.data?.user?.iconUrl

  // コメント送信処理
  const sendComment = async (
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => {
    try {
      await createWorkComment({
        variables: {
          input: {
            workId: props.workId,
            text: text,
            stickerId: stickerId,
          },
        },
      })

      setComment("")
      setIsSensitive(false)

      // 親コンポーネントに通知
      if (props.onCommentAdded) {
        props.onCommentAdded()
      }
    } catch (error) {
      console.error("Failed to send comment:", error)
    }
  }

  const onComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, "", "")
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="size-5" />
        <h3 className="font-semibold">
          {t("コメント", "Comments")} ({props.commentsCount})
        </h3>
      </div>

      {props.isWorkOwnerBlocked ? (
        <div className="mt-3 rounded-md bg-gray-100 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {t(
            "ブロック中のユーザーにはコメントできません",
            "Cannot comment to blocked users",
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex w-full items-start space-x-2 md:space-x-3">
            <Avatar className="flex-shrink-0">
              <AvatarImage src={withIconUrlFallback(userIcon)} alt="" />
              <AvatarFallback />
            </Avatar>
            <div className="min-w-0 flex-1">
              <AutoResizeTextarea
                onChange={(event) => setComment(event.target.value)}
                value={comment}
                placeholder={t("コメントする", "Add a comment")}
                disabled={!authContext.isLoggedIn}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1">
              <Button
                disabled={!authContext.isLoggedIn}
                variant="secondary"
                size="icon"
                onClick={onOpen}
                className="h-8 w-8 md:h-10 md:w-10"
              >
                <StampIcon className="size-4" />
              </Button>
              {isCreatingWorkComment ? (
                <Button
                  disabled
                  className="h-8 px-2 text-xs md:h-10 md:px-4 md:text-sm"
                >
                  <Loader2Icon className="size-4 animate-spin" />
                </Button>
              ) : (
                <Button
                  disabled={!authContext.isLoggedIn}
                  onClick={onComment}
                  className="h-8 px-2 text-xs md:h-10 md:px-4 md:text-sm"
                >
                  {t("送信", "Send")}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 pl-10 text-xs text-muted-foreground md:pl-14">
            <Checkbox
              id="sensitive-checkbox"
              checked={isSensitive}
              onCheckedChange={(checked: boolean) =>
                setIsSensitive(checked === true)
              }
              disabled={!authContext.isLoggedIn}
            />
            <label htmlFor="sensitive-checkbox">
              {t("隠し付き", "Sensitive comment")}
            </label>
            <CrossPlatformTooltip
              text={t(
                "初期表示は非表示になります。クリックで表示されます。",
                "Initially hidden from view. Click to display.",
              )}
            />
          </div>
        </div>
      )}

      {/* スタンプダイアログ */}
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, url: string) => {
          await sendComment(comment, stickerId, url)
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />
    </div>
  )
}

const createWorkCommentMutation = graphql(
  `mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }`,
)

const userQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      id
      iconUrl
    }
  }`,
)
