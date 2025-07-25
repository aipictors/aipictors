import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { useMutation } from "@apollo/client/index"
import {
  ArrowDownToLine,
  Heart,
  Loader2Icon,
  ThumbsUpIcon,
  Eye,
  EyeOff,
} from "lucide-react"
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
  isMuted: boolean
  isSensitive?: boolean
  onDeleteComment: () => void
  onReplyCompleted: (
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => void
  onCreateCommentLike: () => void
  onDeleteCommentLike: () => void
  isWorkOwnerBlocked?: boolean
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
  const [showMutedComment, setShowMutedComment] = React.useState(false)
  const [showSensitiveComment, setShowSensitiveComment] = React.useState(false)

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

  // ミュートされたコメントの表示
  if (props.isMuted && !showMutedComment) {
    return (
      <div className="flex items-center space-x-4 rounded-lg border p-2">
        <EyeOff className="size-5 text-gray-400" />
        <div className="flex flex-1 items-center space-x-2 text-sm">
          <p className="text-sm">
            {t(
              "ミュートしているユーザのコメントです",
              "This is a comment from a muted user",
            )}
          </p>
          <Link to="/settings/muted/users" className="w-16">
            <p className="text-blue-500 text-sm hover:underline">
              {t("(設定)", "(settings)")}
            </p>
          </Link>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowMutedComment(true)}
        >
          <Eye className="mr-2 size-4" />
          {t("表示", "Show")}
        </Button>
      </div>
    )
  }

  // センシティブなコメントの表示
  if (props.isSensitive && !showSensitiveComment) {
    return (
      <div className="flex items-center space-x-4 rounded-lg border p-2">
        <EyeOff className="size-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm">
            {t(
              "隠し付き（もしくはセンシティブ）なコメントです",
              "This is a sensitive comment",
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSensitiveComment(true)}
        >
          <Eye className="mr-2 size-4" />
          {t("表示", "Show")}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "flex items-start space-x-4",
          props.isMuted &&
            "border-gray-300 border-l-2 pl-4 opacity-60 dark:border-gray-700",
        )}
      >
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
          <div className="flex items-center space-x-2">
            <Link to={`/users/${props.userId}`}>
              <span>{props.userName}</span>
            </Link>
            {props.isMuted && (
              <div className="flex items-center space-x-1">
                <EyeOff className="size-3 text-gray-400" />
                <span className="text-gray-500 text-xs dark:text-gray-400">
                  {t("ミュート中", "Muted")}
                </span>
              </div>
            )}
          </div>
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
              isDeleteLoading ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <DeleteCommentConfirmDialog onDeleteComment={onDeleteComment} />
              )
            ) : (
              <>
                {/* biome-ignore lint/a11y/useButtonType: Reply button doesn't need explicit type */}
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
            {props.isMuted && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMutedComment(false)}
              >
                <EyeOff className="mr-1 size-3" />
                {t("非表示", "Hide")}
              </Button>
            )}
            {props.isSensitive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSensitiveComment(false)}
              >
                <EyeOff className="mr-1 size-3" />
                {t("非表示", "Hide")}
              </Button>
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
          isWorkOwnerBlocked={props.isWorkOwnerBlocked}
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
    isMuted
    isSensitive
  }`,
)

const deleteCommentMutation = graphql(
  `mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }`,
)
