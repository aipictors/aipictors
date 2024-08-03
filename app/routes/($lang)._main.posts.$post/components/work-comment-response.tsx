import { AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { Avatar } from "@radix-ui/react-avatar"
import { useMutation } from "@apollo/client/index"
import { ArrowDownToLine, Loader2Icon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import React from "react"
import { ReplyCommentInput } from "~/routes/($lang)._main.posts.$post/components/work-comment-input"
import { StickerInfoDialog } from "~/components/sticker-info-dialog"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"

type Props = {
  isMine: boolean
  userIconImageURL?: string
  userName?: string
  text?: string
  createdAt: number
  replyId: string
  userId: string
  iconUrl: string
  /* コメントで使われてるスタンプ情報 */
  stickerImageURL?: string
  stickerTitle?: string
  stickerId?: string
  stickerAccessType?: string
  isStickerDownloadable?: boolean
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
        <Link to={`/users/${props.userId}`}>
          <Avatar>
            <AvatarImage
              className="h-10 w-10 rounded-full"
              src={props.userIconImageURL}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
        </Link>
        <div className="space-y-0">
          <Link to={`/users/${props.userId}`}>
            <p>{props.userName}</p>
          </Link>
          <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
            {props.text}
          </p>

          {props.stickerImageURL && props.stickerAccessType === "PUBLIC" && (
            <Link
              className="group block w-24 overflow-hidden rounded-md"
              to={`/stickers/${props.stickerId}`}
            >
              <img
                className="w-24 overflow-hidden rounded-md py-2 transition-transform duration-300 group-hover:scale-105"
                alt=""
                src={props.stickerImageURL}
              />
            </Link>
          )}
          {props.stickerImageURL && props.stickerAccessType !== "PUBLIC" && (
            <img className="w-24 py-2" alt="" src={props.stickerImageURL} />
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
                {props.stickerImageURL &&
                  props.stickerAccessType === "PUBLIC" && (
                    <StickerInfoDialog
                      isDownloaded={props.isStickerDownloadable ?? false}
                      stickerId={props.stickerId ?? ""}
                      title={props.stickerTitle ?? ""}
                      imageUrl={props.stickerImageURL}
                    >
                      <ArrowDownToLine className="h-4 w-4" />
                    </StickerInfoDialog>
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
          iconUrl={props.iconUrl}
        />
      )}
    </>
  )
}

const deleteCommentMutation = graphql(
  `mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }`,
)
