import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useState } from "react"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

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
export function ReplyCommentInput(props: Props) {
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
          <AvatarImage src={ExchangeIconUrl(iconUrl)} alt="" />
          <AvatarFallback />
        </Avatar>
        <AutoResizeTextarea
          onChange={(event) => {
            setComment(event.target.value)
          }}
          placeholder="コメントする"
          disabled={!authContext.isLoggedIn}
        />
        <div>
          <Button
            disabled={!authContext.isLoggedIn}
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
            disabled={!authContext.isLoggedIn}
            variant={"secondary"}
            onClick={onComment}
          >
            {"送信"}
          </Button>
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
