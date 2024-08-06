import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { useMutation } from "@apollo/client/index"
import { ArrowDownToLine, Loader2Icon } from "lucide-react"
import React from "react"
import { ReplyCommentInput } from "~/routes/($lang)._main.posts.$post/components/work-comment-input"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { IconUrl } from "~/components/icon-url"
import { StickerInfoDialog } from "~/routes/($lang)._main.users.$user/components/sticker-info-dialog"

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
        <Link to={`/users/${props.userId}`}>
          <Avatar>
            <AvatarImage
              className="w-12 rounded-full"
              src={props.userIconImageURL}
              alt=""
            />
            <AvatarFallback />
          </Avatar>
        </Link>
        <div>
          <Link to={`/users/${props.userId}`}>
            <span>{props.userName}</span>
          </Link>
          {props.text && (
            <p className="overflow-hidden whitespace-pre-wrap break-words text-sm">
              {props.text}
            </p>
          )}
          {props.stickerImageURL && props.stickerAccessType === "PUBLIC" && (
            <Link
              className="group block w-24 overflow-hidden"
              to={`/stickers/${props.stickerId}`}
            >
              <img
                className="w-24 py-2 transition-transform duration-300 group-hover:scale-105"
                alt=""
                src={props.stickerImageURL}
              />
            </Link>
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
          targetCommentId={props.commentId}
          onReplyCompleted={(
            id: string,
            text: string,
            stickerId: string,
            stickerImageURL: string,
          ) => {
            props.onReplyCompleted(id, text, stickerId, stickerImageURL)
          }}
          iconUrl={IconUrl(props.userIconImageURL)}
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
