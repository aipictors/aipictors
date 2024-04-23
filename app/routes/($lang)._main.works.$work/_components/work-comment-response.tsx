import { AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { Avatar } from "@radix-ui/react-avatar"
import { deleteCommentMutation } from "@/_graphql/mutations/delete-comment"
import { useMutation } from "@apollo/client/index.js"
import { Loader2Icon } from "lucide-react"
import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import React from "react"
import { ReplyCommentInput } from "@/routes/($lang)._main.works.$work/_components/work-comment-input"

type Props = {
  isMine: boolean
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
  replyId: string
  userId: string
  onDeleteComment: () => void
  onReplyCompleted?: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
}

/**
 * 作品のコメントへの返信
 */
export const WorkCommentResponse = (props: Props) => {
  const [deleteMutation, { loading: isDeleteLoading }] = useMutation(
    deleteCommentMutation,
  )

  const [openReplyInput, setOpenReplyInput] = React.useState(false)

  const onDeleteComment = async () => {
    props.onDeleteComment()
    await deleteMutation({
      variables: {
        input: {
          commentId: props.replyId,
        },
      },
    })
  }

  return (
    <>
      <div className="flex items-start space-x-4 pl-16">
        <a href={`https://aipictors.com/users/${props.userId}`}>
          <Avatar>
            <AvatarImage
              className="w-12 rounded-full"
              src={props.userIconImageURL}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
        </a>
        <div className="space-y-0">
          <a href={`https://aipictors.com/users/${props.userId}`}>
            <p>{props.userName}</p>
          </a>
          <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
            {props.text}
          </p>
          {props.stickerImageURL && (
            <img className="w-20 py-2" alt="" src={props.stickerImageURL} />
          )}
          <div className="flex space-x-2">
            <p className="text-xs opacity-50">
              {toDateTimeText(props.createdAt)}
            </p>
            {props.isMine ? (
              <>
                {isDeleteLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AppConfirmDialog
                    title={"確認"}
                    description={"コメントを削除しますか？"}
                    onNext={onDeleteComment}
                    onCancel={() => {}}
                  >
                    <p className="cursor-pointer text-xs">{"削除"}</p>
                  </AppConfirmDialog>
                )}
              </>
            ) : (
              <>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button onClick={() => setOpenReplyInput(!openReplyInput)}>
                  <p className="cursor-pointer text-xs">{"返信"}</p>
                </button>
                {props.stickerImageURL && (
                  <p className="cursor-pointer text-xs">{"ダウンロード"}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {!props.isMine && openReplyInput && (
        <ReplyCommentInput
          targetCommentId={props.replyId}
          onReplyCompleted={(
            id: string,
            text: string,
            stickerId,
            stickerImageURL: string,
          ) => {
            if (props.onReplyCompleted) {
              props.onReplyCompleted(id, text, stickerId, stickerImageURL)
            }
          }}
        />
      )}
    </>
  )
}
