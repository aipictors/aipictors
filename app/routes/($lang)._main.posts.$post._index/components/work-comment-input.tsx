import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useState } from "react"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  targetCommentId: string
  iconUrl: string
  onReplyCompleted: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
  isWorkOwnerBlocked?: boolean
}

/**
 * 返信コメント入力欄
 */
export function ReplyCommentInput(props: Props) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const t = useTranslation()

  const [createReplyComment, { loading: isCreatingReplyComment }] = useMutation(
    createResponseCommentMutation,
  )

  const [comment, setComment] = useState("")

  const [isSensitive, setIsSensitive] = useState(false)

  const sendComment = async (
    text: string,
    targetCommentId: string,
    stickerId?: string,
    stickerImageURL?: string,
  ) => {
    try {
      if (props.targetCommentId !== undefined) {
        const commentRes = await createReplyComment({
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

        props.onReplyCompleted(
          commentRes.data?.createResponseComment.id ?? "",
          comment,
          stickerId ?? "",
          stickerImageURL ?? "",
        )
      }
    } catch (_e) {
      // toast(
      //   t("送信に失敗しました。同じコメントを何度も送信しようとしているか、通信エラーが発生しています。", "Failed to send. Please try again or check your connection.")
      // )
    }
  }

  const onComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, props.targetCommentId)
  }

  const authContext = useContext(AuthContext)

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""

  return (
    <>
      <div className="space-y-2 pl-16">
        <div className="flex w-full items-center space-x-4">
          <Avatar>
            <AvatarImage src={withIconUrlFallback(iconUrl)} alt="" />
            <AvatarFallback />
          </Avatar>
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
          {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
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
          </div>
        </div>
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
      }
    }
  }`,
)
