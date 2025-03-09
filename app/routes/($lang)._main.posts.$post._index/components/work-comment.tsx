import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { useMutation } from "@apollo/client/index"
import { ArrowDownToLine, Heart, Loader2Icon, ThumbsUpIcon } from "lucide-react"
import React from "react"
import { ReplyCommentInput } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-input"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { StickerInfoDialog } from "~/routes/($lang)._main.users.$user._index/components/sticker-info-dialog"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { toast } from "sonner"
import { DeleteCommentConfirmDialog } from "~/routes/($lang)._main.posts.$post._index/components/delete-comment-confirm-dialog"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

type Props = {
  userId: string
  isMine: boolean
  userIconImageURL?: string
  userName?: string
  text?: string
  createdAt: number
  commentId: string
  isLiked: boolean
  isNowLiked: boolean
  likesCount: number
  workOwnerIconImageURL?: string
  isWorkOwnerLiked: boolean
  isLoadingCommentLike?: boolean
  isDisabledCommentLike?: boolean
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
  onCreateCommentLike: () => void
  onDeleteCommentLike: () => void
}

/**
 * 作品へのコメント
 */
export function WorkComment(props: Props) {
  const t = useTranslation()

  const [deleteMutation, { loading: isDeleteLoading }] = useMutation(
    deleteCommentMutation,
  )

  const [openReplyInput, setOpenReplyInput] = React.useState(false)

  const onDeleteComment = async () => {
    props.onDeleteComment()
    try {
      await deleteMutation({
        variables: {
          input: {
            commentId: props.commentId,
          },
        },
      })
    } catch (e) {
      console.error(e)
      toast.error(
        t(
          "既に削除済みの可能性があります、しばらくしたら反映されます",
          "It may have already been deleted, it will be reflected after a while",
        ),
      )
    }
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
        <div className="flex flex-col space-y-2">
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
              className="group block w-32 overflow-hidden"
              to={`/stickers/${props.stickerId}`}
            >
              <img
                className="w-32 py-2 transition-transform duration-300 group-hover:scale-105"
                alt=""
                src={props.stickerImageURL}
              />
            </Link>
          )}
          {props.stickerImageURL && props.stickerAccessType !== "PUBLIC" && (
            <img className="w-32 py-2" alt="" src={props.stickerImageURL} />
          )}
          <div className="flex items-center space-x-2">
            <span className="text-xs opacity-50">
              {toDateTimeText(props.createdAt, true)}
            </span>
            {props.isWorkOwnerLiked && (
              <div className="relative">
                <Avatar className="relative size-4">
                  <AvatarImage
                    src={withIconUrlFallback(props.workOwnerIconImageURL)}
                    alt=""
                  />
                  <AvatarFallback />
                </Avatar>
                <Heart
                  className={"absolute right-0 bottom-0 fill-rose-500"}
                  size={"8"}
                />
              </div>
            )}
            {
              <div className="flex items-center space-x-2">
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={
                    props.isLiked || props.isNowLiked
                      ? props.onDeleteCommentLike
                      : props.onCreateCommentLike
                  }
                  disabled={props.isDisabledCommentLike}
                  className={"flex items-center space-x-1"}
                >
                  <ThumbsUpIcon
                    className={cn(
                      "w-3",
                      props.isLiked || props.isNowLiked
                        ? "fill-black dark:fill-white"
                        : "",
                    )}
                  />
                  {props.likesCount + (props.isNowLiked ? 1 : 0) > 0 && (
                    <p className="cursor-pointer text-xs">
                      {props.likesCount + (props.isNowLiked ? 1 : 0)}
                    </p>
                  )}
                </Button>
              </div>
            }
            {props.isMine ? (
              <>
                {isDeleteLoading ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <DeleteCommentConfirmDialog
                    onDeleteComment={onDeleteComment}
                  />
                )}
              </>
            ) : (
              <>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button onClick={() => setOpenReplyInput(!openReplyInput)}>
                  <p className="cursor-pointer text-xs">{t("返信", "Reply")}</p>
                </button>
                {props.stickerImageURL &&
                  props.stickerAccessType === "PUBLIC" && (
                    <StickerInfoDialog
                      isDownloaded={props.isStickerDownloadable ?? false}
                      stickerId={props.stickerId ?? ""}
                      title={props.stickerTitle ?? ""}
                      imageUrl={props.stickerImageURL}
                    >
                      <ArrowDownToLine className="size-4" />
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
          iconUrl={withIconUrlFallback(props.userIconImageURL)}
        />
      )}
    </>
  )
}

export const WorkCommentFragment = graphql(
  `fragment WorkComment on CommentNode @_unmask  {
    id
    createdAt
    text
    likesCount
    isWorkOwnerLiked
    isLiked
    user {
      id
      name
      login
      iconUrl
      nanoid
    }
    sticker {
      id
      imageUrl
      title
      isDownloaded
      likesCount
      usesCount
      downloadsCount
      accessType
    }
  }`,
)

const deleteCommentMutation = graphql(
  `mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }`,
)
