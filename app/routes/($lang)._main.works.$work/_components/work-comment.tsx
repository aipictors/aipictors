import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { AppConfirmDialog } from "@/_components/app/app-confirm-dialog"
import { deleteCommentMutation } from "@/_graphql/mutations/delete-comment"
import { useMutation } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import React from "react"
import { ReplyCommentInput } from "@/routes/($lang)._main.works.$work/_components/work-comment-input"
import { StickerInfoDialog } from "@/_components/sticker-info-dialog"

type Props = {
  userId: string
  isMine: boolean
  userIconImageURL?: string
  userName?: string
  text?: string
  createdAt: number
  commentId: string
  /* コメントで使われてるスタンプ情報 */
  stickerImageURL?: string
  stickerTitle?: string
  stickerId?: string
  stickerAccessType?: string
  isStickerDownloadable?: boolean
  onDeleteComment: () => void
  onReplyCompleted: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
}

/**
 * 作品へのコメント
 */
export const WorkComment = (props: Props) => {
  const [deleteMutation, { loading: isDeleteLoading }] = useMutation(
    deleteCommentMutation,
  )

  const [openReplyInput, setOpenReplyInput] = React.useState(false)

  const onDeleteComment = async () => {
    props.onDeleteComment()
    await deleteMutation({
      variables: {
        input: {
          commentId: props.commentId,
        },
      },
    })
  }

  return (
    <>
      <div className="flex items-start space-x-4">
        <a href={`/users/${props.userId}`}>
          <Avatar>
            <AvatarImage
              className="w-12 rounded-full"
              src={props.userIconImageURL}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
        </a>
        <div>
          <a href={`/users/${props.userId}`}>
            <span>{props.userName}</span>
          </a>
          {props.text && (
            <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
              {props.text}
            </p>
          )}
          {props.stickerImageURL && props.stickerAccessType === "PUBLIC" && (
            <a
              className="block w-24"
              href={`https://www.aipictors.com/stamp/?id=${props.stickerId}`}
            >
              <img className="w-24 py-2" alt="" src={props.stickerImageURL} />
            </a>
          )}
          {props.stickerImageURL && props.stickerAccessType !== "PUBLIC" && (
            <img className="w-24 py-2" alt="" src={props.stickerImageURL} />
          )}
          <div className="flex space-x-2">
            <span className="text-xs opacity-50">
              {toDateTimeText(props.createdAt)}
            </span>
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
                {props.stickerImageURL &&
                  props.stickerAccessType === "PUBLIC" && (
                    <StickerInfoDialog
                      isDownloaded={props.isStickerDownloadable ?? false}
                      stickerId={props.stickerId ?? ""}
                      title={props.stickerTitle ?? ""}
                      imageUrl={props.stickerImageURL}
                    >
                      <p className="cursor-pointer text-xs">{"ダウンロード"}</p>
                    </StickerInfoDialog>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
      {!props.isMine && openReplyInput && (
        <ReplyCommentInput
          targetCommentId={props.commentId}
          onReplyCompleted={(
            id: string,
            text: string,
            stickerId: string,
            stickerImageURL: string,
          ) => {
            props.onReplyCompleted(id, text, stickerId, stickerImageURL)
          }}
        />
      )}
    </>
  )
}
