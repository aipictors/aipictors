import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2Icon, StampIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { StickerDialog } from "@/routes/($lang)._main.posts.$post/components/sticker-dialog"
import { useBoolean } from "usehooks-ts"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { AutoResizeTextarea } from "@/components/auto-resize-textarea"
import { graphql } from "gql.tada"
import { AuthContext } from "@/contexts/auth-context"
import { IconUrl } from "@/components/icon-url"

type Props = {
  targetCommentId: string
  iconUrl: string
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

  const authContext = useContext(AuthContext)

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const iconUrl = data?.viewer?.user?.iconUrl ?? ""

  return (
    <>
      <div className="flex w-full items-center space-x-4 pl-16">
        <Avatar>
          <AvatarImage src={IconUrl(iconUrl)} alt="" />
          <AvatarFallback />
        </Avatar>
        <AutoResizeTextarea
          onChange={(event) => {
            setComment(event.target.value)
          }}
          placeholder="コメントする"
        />
        <div>
          <Button variant={"secondary"} size={"icon"} onClick={onOpen}>
            <StampIcon className="w-16" />
          </Button>
        </div>
        {isCreatingReplyComment ? (
          <Button onClick={() => {}}>
            <Loader2Icon className={"w-16 animate-spin"} />
          </Button>
        ) : (
          <Button variant={"secondary"} onClick={onComment}>
            {"送信"}
          </Button>
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
      user {
        iconUrl
      }
    }
  }`,
)
