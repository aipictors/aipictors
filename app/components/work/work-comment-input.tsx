import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import { useState, useContext } from "react"
import { StampIcon } from "lucide-react"
import { graphql } from "gql.tada"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { useBoolean } from "usehooks-ts"
import { StickerDialog } from "~/components/work/sticker-dialog"
import { getApolloErrorMessage } from "~/utils/get-apollo-error-message"

type Props = {
  targetCommentId: string
  onReplyCompleted: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
  isWorkOwnerBlocked?: boolean
}

/**
 * 返信コメント入力欄（作品ダイアログ用）
 */
export function WorkCommentInput (props: Props): React.ReactNode {
  const authContext = useContext(AuthContext)
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const t = useTranslation()

  const [comment, setComment] = useState("")
  const [isSensitive, setIsSensitive] = useState(false)

  const [createResponseComment, { loading: isCreatingReplyComment }] =
    useMutation(createResponseCommentMutation)

  const sendComment = async (
    text: string,
    targetCommentId: string,
    stickerId: string,
    stickerImageURL: string,
  ) => {
    try {
      const commentRes = await createResponseComment({
        variables: {
          input: {
            commentId: targetCommentId,
            text: text,
            stickerId: stickerId,
          },
        },
      })

      setComment("")
      setIsSensitive(false)

      if (props.onReplyCompleted && commentRes.data?.createResponseComment) {
        props.onReplyCompleted(
          commentRes.data?.createResponseComment.id ?? "",
          comment,
          stickerId ?? "",
          stickerImageURL ?? "",
        )
      } else {
        throw new Error(
          t(
            "スタンプの送信に失敗しました。しばらくしてから再度お試しください。",
            "Failed to send the sticker. Please try again later.",
          ),
        )
      }
    } catch (_e) {
      toast(
        getApolloErrorMessage(_e) ??
          t(
            "送信に失敗しました。しばらくしてから再度お試しください。",
            "Failed to send. Please try again later.",
          ),
      )
    }
  }

  const onComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, props.targetCommentId, "", "")
  }

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""
  const avatarFrame = data?.viewer?.user?.avatarFrame ?? null

  return (
    <>
      <div className="space-y-2 pl-16">
        <div className="flex w-full items-center space-x-4">
          <UserAvatarWithFrame
            alt={authContext.displayName ?? ""}
            frame={avatarFrame}
            isAnimated={false}
            sizeClassName="size-10"
            src={withIconUrlFallback(iconUrl)}
          />
          <AutoResizeTextarea
            onChange={(event) => {
              setComment(event.target.value)
            }}
            placeholder={t("コメントする", "Add a comment")}
            disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
          />
          <div>
            <Button
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
              variant={"secondary"}
              size={"icon"}
              onClick={onOpen}
            >
              <StampIcon className="w-16" />
            </Button>
          </div>
          {isCreatingReplyComment ? (
            <Button onClick={() => {}}>
              <Loader2Icon className={"w-16 animate-spin"} />
            </Button>
          ) : (
            <Button
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
              variant={"secondary"}
              onClick={onComment}
            >
              {t("送信", "Send")}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2 pl-14 opacity-80">
          <Checkbox
            id="reply-sensitive-checkbox"
            checked={isSensitive}
            onCheckedChange={(checked: boolean) =>
              setIsSensitive(checked === true)
            }
            disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
          />
          <div className="flex items-center space-x-2">
            <label htmlFor="reply-sensitive-checkbox" className="text-xs">
              {t("隠し付き", "Sensitive comment")}
            </label>
            <CrossPlatformTooltip
              text={t(
                "初期表示は非表示になります。クリックで表示されます。",
                "You can check new works with this tag in your timeline",
              )}
            />
          </div>
        </div>
        {props.isWorkOwnerBlocked && (
          <p className="pl-14 text-amber-600 text-xs">
            {t(
              "このユーザーをブロック中のため、コメントとスタンプは送信できません。",
              "You cannot send comments or stickers because this user is blocked.",
            )}
          </p>
        )}
      </div>
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, stickerImageURL: string) => {
          await sendComment(
            comment,
            props.targetCommentId,
            stickerId,
            stickerImageURL,
          )

          setComment("")
          onClose()
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />
    </>
  )
}

const createResponseCommentMutation = graphql(
  `mutation CreateResponseComment($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }`,
)

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        iconUrl
        avatarFrame {
          id
          frameType
          backgroundStyle
          overlayImageUrl
          borderPadding
        }
      }
    }
  }`,
)
