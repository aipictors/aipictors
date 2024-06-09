import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { Loader2Icon, StampIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { createResponseCommentMutation } from "@/_graphql/mutations/create-response-comment"
import { StickerDialog } from "@/routes/($lang)._main.works.$work/_components/sticker-dialog"
import { useBoolean } from "usehooks-ts"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"

type Props = {
  targetCommentId: string
  onReplyCompleted: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
}

/**
 * 返信コメント入力欄
 */
export const ReplyCommentInput = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const appContext = useContext(AuthContext)

  const [createReplyComment, { loading: isCreatingReplyComment }] = useMutation(
    createResponseCommentMutation,
  )

  const [comment, setComment] = useState("")

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

        props.onReplyCompleted(
          commentRes.data?.createResponseComment.id ?? "",
          comment,
          stickerId ?? "",
          stickerImageURL ?? "",
        )
      }
    } catch (e) {
      toast(
        "送信に失敗しました。同じコメントを何度も送信しようとしているか、通信エラーが発生しています。",
      )
    }
  }

  const onComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast("コメントを入力してください")
      return
    }

    sendComment(inputComment, props.targetCommentId)
  }

  return (
    <>
      <div className="flex w-full items-center space-x-2 pl-16">
        <Avatar>
          <AvatarImage src={appContext.avatarPhotoURL ?? undefined} alt="" />
          <AvatarFallback />
        </Avatar>
        <AutoResizeTextarea
          onChange={(event) => {
            setComment(event.target.value)
          }}
          placeholder="コメントする"
        />
        <div>
          <Button size={"icon"} onClick={onOpen}>
            <StampIcon />
          </Button>
        </div>
        {isCreatingReplyComment ? (
          <Button onClick={() => {}}>
            <Loader2Icon className={"animate-spin"} />
          </Button>
        ) : (
          <Button onClick={onComment}>{"送信"}</Button>
        )}
      </div>
      <Suspense fallback={<AppLoadingPage />}>
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
        />
      </Suspense>
    </>
  )
}
