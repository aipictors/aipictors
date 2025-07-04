import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { AuthContext } from "~/contexts/auth-context"
import {
  WorkComment,
  WorkCommentFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/work-comment"
import { Loader2Icon, StampIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useBoolean } from "usehooks-ts"
import { useMutation, useQuery } from "@apollo/client/index"
import { toast } from "sonner"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { type FragmentOf, graphql } from "gql.tada"
import { ExpansionTransition } from "~/components/expansion-transition"
import { StickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/sticker-dialog"
import {
  StickerButton,
  StickerButtonFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { WorkCommentResponse } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-response"

type Props = {
  workId: string
  workOwnerIconImageURL?: string | null
  comments: FragmentOf<typeof CommentListItemFragment>[]
  defaultShowCommentCount?: number
  isWorkOwnerBlocked?: boolean
}

// コメント
type Comment = {
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    iconUrl: string
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

// 返信コメント
type ReplyComment = {
  replyTargetId: string
  id: string
  text: string
  createdAt: number
  isLiked: boolean
  isMuted: boolean
  isSensitive?: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user: {
    id: string
    name: string
    iconUrl: string
  }
  sticker: {
    image: {
      downloadURL: string
    }
  }
}

// 日本時間の日付を計算する関数
const getJSTDate = () => {
  const date = new Date()
  const utcOffset = date.getTimezoneOffset() * 60000 // 分単位のオフセットをミリ秒に変換
  const jstOffset = 9 * 60 * 60 * 1000 // JSTはUTC+9
  const jstDate = new Date(date.getTime() + utcOffset + jstOffset)
  return jstDate
}

/**
 * 作品へのコメント一覧
 */
export function WorkCommentList(props: Props) {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const t = useTranslation()

  const appContext = useContext(AuthContext)

  const [createWorkComment, { loading: isCreatingWorkComment }] = useMutation(
    createWorkCommentMutation,
  )

  const [createCommentLike, { loading: isCreatingCommentLike }] = useMutation(
    createCommentLikeMutation,
  )

  const [deleteCommentLike, { loading: isDeletingCommentLike }] = useMutation(
    deleteCommentLikeMutation,
  )

  const [comment, setComment] = useState("")

  const [isSensitive, setIsSensitive] = useState(false)

  const [newComments, setNewComments] = useState<Comment[]>([])

  const [newReplyComments, setNewReplyComments] = useState<ReplyComment[]>([])

  const [hideCommentIds, setHideCommentIds] = useState<string[]>([])

  const showComments = props.comments.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const authContext = useContext(AuthContext)

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId ?? "0",
    },
  })

  const userIcon = userResp?.data?.user?.iconUrl

  const showNewComments = newComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const showNewReplyComments = newReplyComments?.filter(
    (comment) => !hideCommentIds.includes(comment.id),
  )

  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])

  useEffect(() => {
    if (newComments !== null) {
      setNewComments([])
    }
  }, [props.workId])

  const sendComment = async (
    text: string,
    stickerId: string,
    stickerImageURL: string,
    targetWorkId: string,
    iconUrl: string | null | undefined = null,
  ) => {
    try {
      if (targetWorkId !== undefined) {
        const res = await createWorkComment({
          variables: {
            input: {
              workId: targetWorkId,
              text: text,
              stickerId: stickerId,
              // TODO: Add isSensitive to GraphQL schema
              // isSensitive: isSensitive ?? false,
            },
          },
        })

        setComment("")
        setIsSensitive(false)

        setNewComments([
          {
            id: res.data?.createWorkComment?.id ?? "",
            text: text,
            createdAt: getJSTDate().getTime() / 1000,
            likesCount: 0,
            isWorkOwnerLiked: false,
            isLiked: false,
            user: {
              id: appContext.userId ?? "",
              name: appContext.displayName ?? "",
              iconUrl: withIconUrlFallback(iconUrl),
            },
            sticker: {
              image: {
                downloadURL: stickerImageURL,
              },
            },
            isMuted: false,
            isSensitive: isSensitive,
            ...newComments,
          },
        ])
      }
    } catch (_e) {
      // toast(
      //   t(
      //     "送信に失敗しました。同じコメントを何度も送信しようとしているか、通信エラーが発生しています。",
      //     "Failed to send. Please try again.",
      //   ),
      // )
    }
  }

  const onCreateCommentLike = async (commentId: string) => {
    try {
      await createCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds([...likedCommentIds, commentId])
      setCanceledCommentIds(canceledCommentIds.filter((id) => id !== commentId))
    } catch (_e) {
      // toast(
      //   t(
      //     "いいねに失敗しました。通信エラーが発生しています。",
      //     "Failed to like. Please try again.",
      //   ),
      // )
    }
  }

  const onDeleteCommentLike = async (commentId: string) => {
    try {
      await deleteCommentLike({
        variables: {
          input: {
            commentId: commentId,
          },
        },
      })
      setLikedCommentIds(likedCommentIds.filter((id) => id !== commentId))
      setCanceledCommentIds([...canceledCommentIds, commentId])
    } catch (_e) {
      toast(
        t(
          "いいねの取り消しに失敗しました。通信エラーが発生しています。",
          "Failed to unlike. Please try again.",
        ),
      )
    }
  }

  const onDeleteComment = (commentId: string) => {
    setHideCommentIds([...hideCommentIds, commentId])
  }

  const onWorkComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, "-1", "", props.workId, userIcon)
  }

  const showCommentsBeforeMore = showComments.slice(
    0,
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const showCommentsAfterMore = showComments.slice(
    props.defaultShowCommentCount ? props.defaultShowCommentCount : 8,
  )

  const { data = null } = useQuery(viewerUserQuery, {
    skip: authContext.isLoading,
  })

  const stickers = data?.viewer?.userStickers ?? []

  return (
    <>
      <div className="space-y-4">
        <p>
          {t("コメント", "Comments")} (
          {showComments.length + (showNewComments?.length ?? 0)})
        </p>
        {props.isWorkOwnerBlocked && (
          <div className="rounded-md bg-gray-100 p-3 text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
            {t(
              "ブロック中のユーザーにはコメントできません",
              "Cannot comment to blocked users",
            )}
          </div>
        )}
        {stickers.length > 0 && !props.isWorkOwnerBlocked && (
          <div className="flex space-x-2 overflow-x-auto">
            {stickers.map((sticker) => (
              <StickerButton
                key={sticker.id}
                imageUrl={sticker.imageUrl ?? ""}
                title={sticker.title}
                onClick={async () => {
                  try {
                    await sendComment(
                      comment,
                      sticker.id,
                      sticker.imageUrl ?? "",
                      props.workId,
                      userIcon,
                    )
                  } catch (error) {
                    console.error("Failed to send comment:", error)
                  }
                }}
                size="2x-large"
                disabled={props.isWorkOwnerBlocked}
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex w-full items-center space-x-4">
            <Avatar>
              <AvatarImage src={withIconUrlFallback(userIcon)} alt="" />
              <AvatarFallback />
            </Avatar>
            <AutoResizeTextarea
              onChange={(event) => {
                setComment(event.target.value)
              }}
              value={comment}
              placeholder={t("コメントする", "Add a comment")}
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
            />
            <Button
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
              variant={"secondary"}
              size={"icon"}
              onClick={onOpen}
            >
              <StampIcon className="w-16" />
            </Button>
            {isCreatingWorkComment ? (
              <Button onClick={() => {}}>
                <Loader2Icon className={"w-16 animate-spin"} />
              </Button>
            ) : (
              <Button
                disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
                variant={"secondary"}
                onClick={onWorkComment}
              >
                {t("送信", "Send")}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2 pl-14 opacity-30">
            {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
            <Checkbox
              id="sensitive-checkbox"
              checked={isSensitive}
              onCheckedChange={(checked: boolean) =>
                setIsSensitive(checked === true)
              }
              disabled={!authContext.isLoggedIn || props.isWorkOwnerBlocked}
            />
            <div className="flex items-center space-x-2">
              <label htmlFor="sensitive-checkbox" className="text-xs">
                {t("センシティブなコメントとして送信する", "Sensitive comment")}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto">
        {showNewComments && (
          <div className="space-y-4">
            {showNewComments.map((comment) => (
              <div key={`${props.workId}-${comment.id}`}>
                <WorkComment
                  userId={comment.user?.id ?? ""}
                  isMine={comment.user?.id === appContext.userId}
                  createdAt={comment.createdAt}
                  stickerImageURL={comment.sticker?.image?.downloadURL}
                  text={comment.text}
                  workOwnerIconImageURL={withIconUrlFallback(
                    props.workOwnerIconImageURL,
                  )}
                  userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
                  userName={comment.user?.name}
                  commentId={comment.id}
                  isLiked={
                    comment.isLiked && !canceledCommentIds.includes(comment.id)
                  }
                  isMuted={comment.isLiked}
                  isSensitive={comment.isSensitive}
                  isNowLiked={likedCommentIds.includes(comment.id)}
                  likesCount={
                    comment.likesCount -
                    (canceledCommentIds.includes(comment.id) ? 1 : 0)
                  }
                  isWorkOwnerLiked={comment.isWorkOwnerLiked}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  onCreateCommentLike={() => onCreateCommentLike(comment.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
                  onDeleteComment={() => onDeleteComment(comment.id)}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                  onReplyCompleted={(
                    id: string,
                    text: string,
                    _stickerId: string,
                    stickerImageURL: string,
                  ) => {
                    setNewComments([
                      {
                        id: id,
                        text: text,
                        createdAt: getJSTDate().getTime() / 1000,
                        likesCount: 0,
                        isWorkOwnerLiked: false,
                        isLiked: false,
                        user: {
                          id: appContext.userId ?? "",
                          name: appContext.displayName ?? "",
                          iconUrl: withIconUrlFallback(userIcon),
                        },
                        sticker: {
                          image: {
                            downloadURL: stickerImageURL,
                          },
                        },
                        isMuted: false,
                        ...newComments,
                      },
                    ])
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {showCommentsBeforeMore.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <WorkComment
              userId={comment.user?.id ?? ""}
              isMine={comment.user?.id === appContext.userId}
              createdAt={comment.createdAt}
              stickerImageURL={comment.sticker?.imageUrl ?? ""}
              stickerTitle={comment.sticker?.title}
              stickerId={comment.sticker?.id}
              stickerAccessType={comment.sticker?.accessType}
              isStickerDownloadable={comment.sticker?.isDownloaded}
              text={comment.text}
              userName={comment.user?.name}
              commentId={comment.id}
              isLiked={
                comment.isLiked && !canceledCommentIds.includes(comment.id)
              }
              isMuted={Boolean(comment.isMuted)}
              isSensitive={Boolean(comment.isSensitive)}
              isNowLiked={likedCommentIds.includes(comment.id)}
              likesCount={
                comment.likesCount -
                (canceledCommentIds.includes(comment.id) ? 1 : 0)
              }
              isWorkOwnerLiked={comment.isWorkOwnerLiked}
              onCreateCommentLike={() => onCreateCommentLike(comment.id)}
              onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
              isDisabledCommentLike={!appContext.isLoggedIn}
              isLoadingCommentLike={
                isCreatingCommentLike || isDeletingCommentLike
              }
              workOwnerIconImageURL={withIconUrlFallback(
                props.workOwnerIconImageURL,
              )}
              userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
              onDeleteComment={() => onDeleteComment(comment.id)}
              isWorkOwnerBlocked={props.isWorkOwnerBlocked}
              onReplyCompleted={(
                id: string,
                text: string,
                _stickerId: string,
                stickerImageURL: string,
              ) => {
                setNewReplyComments([
                  ...newReplyComments,
                  {
                    replyTargetId: comment.id,
                    id: id,
                    text: text,
                    createdAt: Date.now(),
                    likesCount: 0,
                    isWorkOwnerLiked: false,
                    isLiked: false,
                    isMuted: false,
                    isSensitive: false, // TODO: Get this value from ReplyCommentInput
                    user: {
                      id: appContext.userId ?? "",
                      name: appContext.displayName ?? "",
                      iconUrl: withIconUrlFallback(userIcon),
                    },
                    sticker: {
                      image: {
                        downloadURL: stickerImageURL,
                      },
                    },
                  },
                ])
              }}
            />
            {/* 新しく追加した返信への返信 */}
            {showNewReplyComments?.map((newReply) =>
              newReply.replyTargetId !== comment.id ? null : (
                <WorkCommentResponse
                  key={newReply.id}
                  userId={newReply.user?.id ?? ""}
                  isMine={newReply.user?.id === appContext.userId}
                  createdAt={newReply.createdAt}
                  stickerImageURL={newReply.sticker?.image?.downloadURL}
                  text={newReply.text}
                  iconUrl={withIconUrlFallback(userIcon)}
                  userName={newReply.user?.name}
                  replyId={newReply.id}
                  targetCommentId={comment.id}
                  isLiked={
                    newReply.isLiked &&
                    !canceledCommentIds.includes(newReply.id)
                  }
                  isMuted={newReply.isMuted}
                  isSensitive={newReply.isSensitive}
                  isNowLiked={likedCommentIds.includes(newReply.id)}
                  likesCount={
                    newReply.likesCount -
                    (canceledCommentIds.includes(newReply.id) ? 1 : 0)
                  }
                  isWorkOwnerLiked={newReply.isWorkOwnerLiked}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  onCreateCommentLike={() => onCreateCommentLike(newReply.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(newReply.id)}
                  onDeleteComment={() => {
                    onDeleteComment(newReply.id)
                  }}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                />
              ),
            )}
            {/* コメントへの返信 */}
            {comment.responses !== null &&
              comment.responses?.length !== 0 &&
              comment.responses
                // .sort((a, b) => a.createdAt - b.createdAt)
                .filter((reply) => !hideCommentIds.includes(reply.id))
                .map((reply) => (
                  <WorkCommentResponse
                    key={reply.id}
                    userId={reply.user?.id ?? ""}
                    isMine={reply.user?.id === appContext.userId}
                    createdAt={reply.createdAt}
                    stickerImageURL={reply.sticker?.imageUrl ?? ""}
                    stickerTitle={reply.sticker?.title}
                    stickerId={reply.sticker?.id}
                    stickerAccessType={reply.sticker?.accessType}
                    isStickerDownloadable={reply.sticker?.isDownloaded}
                    isWorkOwnerLiked={reply.isWorkOwnerLiked}
                    isDisabledCommentLike={!appContext.isLoggedIn}
                    text={reply.text}
                    userIconImageURL={withIconUrlFallback(reply.user?.iconUrl)}
                    isLiked={
                      reply.isLiked && !canceledCommentIds.includes(reply.id)
                    }
                    isMuted={Boolean(reply.isMuted)}
                    isSensitive={Boolean(reply.isSensitive)}
                    isNowLiked={likedCommentIds.includes(reply.id)}
                    likesCount={
                      reply.likesCount -
                      (canceledCommentIds.includes(reply.id) ? 1 : 0)
                    }
                    onCreateCommentLike={() => onCreateCommentLike(reply.id)}
                    onDeleteCommentLike={() => onDeleteCommentLike(reply.id)}
                    userName={reply.user?.name}
                    replyId={reply.id}
                    targetCommentId={comment.id}
                    iconUrl={withIconUrlFallback(userIcon)}
                    onDeleteComment={() => {
                      onDeleteComment(reply.id)
                    }}
                    isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                    onReplyCompleted={(
                      id: string,
                      text: string,
                      _stickerId: string,
                      stickerImageURL: string,
                    ) => {
                      // 表示コメントを追加
                      setNewReplyComments([
                        ...newReplyComments,
                        {
                          replyTargetId: comment.id,
                          id: id,
                          text: text,
                          createdAt: Date.now(),
                          likesCount: 0,
                          isWorkOwnerLiked: false,
                          isLiked: false,
                          isMuted: false,
                          isSensitive: false, // TODO: Get this value from ReplyCommentInput
                          user: {
                            id: appContext.userId ?? "",
                            name: appContext.displayName ?? "",
                            iconUrl: withIconUrlFallback(userIcon),
                          },
                          sticker: {
                            image: {
                              downloadURL: stickerImageURL,
                            },
                          },
                        },
                      ])
                    }}
                  />
                ))}
          </div>
        ))}
        {showCommentsAfterMore.length > 0 && (
          <ExpansionTransition
            triggerChildren={
              <Button className="w-full" variant={"secondary"}>
                {t("もっと見る", "Load more")} ({showCommentsAfterMore.length})
              </Button>
            }
            oneTimeExpand={true}
            className="flex flex-col space-y-4"
          >
            {showCommentsAfterMore.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <WorkComment
                  userId={comment.user?.id ?? ""}
                  isMine={comment.user?.id === appContext.userId}
                  createdAt={comment.createdAt}
                  stickerImageURL={comment.sticker?.imageUrl ?? ""}
                  stickerTitle={comment.sticker?.title}
                  stickerId={comment.sticker?.id}
                  stickerAccessType={comment.sticker?.accessType}
                  isStickerDownloadable={comment.sticker?.isDownloaded}
                  isWorkOwnerLiked={comment.isWorkOwnerLiked}
                  workOwnerIconImageURL={withIconUrlFallback(
                    props.workOwnerIconImageURL,
                  )}
                  userIconImageURL={withIconUrlFallback(comment.user?.iconUrl)}
                  isLiked={
                    comment.isLiked && !canceledCommentIds.includes(comment.id)
                  }
                  isMuted={Boolean(comment.isMuted)}
                  isSensitive={Boolean(comment.isSensitive)}
                  isNowLiked={likedCommentIds.includes(comment.id)}
                  likesCount={
                    comment.likesCount -
                    (canceledCommentIds.includes(comment.id) ? 1 : 0)
                  }
                  onCreateCommentLike={() => onCreateCommentLike(comment.id)}
                  onDeleteCommentLike={() => onDeleteCommentLike(comment.id)}
                  isDisabledCommentLike={!appContext.isLoggedIn}
                  isLoadingCommentLike={
                    isCreatingCommentLike || isDeletingCommentLike
                  }
                  text={comment.text}
                  userName={comment.user?.name}
                  commentId={comment.id}
                  onDeleteComment={() => onDeleteComment(comment.id)}
                  isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                  onReplyCompleted={(
                    id: string,
                    text: string,
                    _stickerId: string,
                    stickerImageURL: string,
                  ) => {
                    setNewReplyComments([
                      ...(newReplyComments || []),
                      {
                        replyTargetId: comment.id,
                        id: id,
                        text: text,
                        createdAt: Date.now(),
                        likesCount: 0,
                        isWorkOwnerLiked: false,
                        isLiked: false,
                        isMuted: false,
                        isSensitive: false, // TODO: Get this value from ReplyCommentInput
                        user: {
                          id: appContext.userId ?? "",
                          name: appContext.displayName ?? "",
                          iconUrl: withIconUrlFallback(userIcon),
                        },
                        sticker: {
                          image: {
                            downloadURL: stickerImageURL,
                          },
                        },
                      },
                    ])
                  }}
                />
                {/* 新しく追加した返信への返信 */}
                {showNewReplyComments?.map((newReply) =>
                  newReply.replyTargetId !== comment.id ? null : (
                    <WorkCommentResponse
                      key={newReply.id}
                      userId={newReply.user?.id ?? ""}
                      isMine={newReply.user?.id === appContext.userId}
                      createdAt={newReply.createdAt}
                      stickerImageURL={newReply.sticker?.image?.downloadURL}
                      text={newReply.text}
                      iconUrl={withIconUrlFallback(userIcon)}
                      isWorkOwnerLiked={newReply.isWorkOwnerLiked}
                      isNowLiked={likedCommentIds.includes(newReply.id)}
                      workOwnerIconImageURL={withIconUrlFallback(
                        props.workOwnerIconImageURL,
                      )}
                      userIconImageURL={withIconUrlFallback(
                        newReply.user.iconUrl,
                      )}
                      isLiked={
                        newReply.isLiked &&
                        !canceledCommentIds.includes(newReply.id)
                      }
                      isMuted={newReply.isMuted}
                      isSensitive={newReply.isSensitive}
                      likesCount={
                        newReply.likesCount -
                        (canceledCommentIds.includes(newReply.id) ? 1 : 0)
                      }
                      onCreateCommentLike={() =>
                        onCreateCommentLike(newReply.id)
                      }
                      onDeleteCommentLike={() =>
                        onDeleteCommentLike(newReply.id)
                      }
                      userName={newReply.user?.name}
                      replyId={newReply.id}
                      targetCommentId={comment.id}
                      onDeleteComment={() => {
                        onDeleteComment(newReply.id)
                      }}
                      isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                    />
                  ),
                )}
                {/* コメントへの返信 */}
                {comment.responses !== null &&
                  comment.responses?.length !== 0 &&
                  comment.responses
                    // .sort((a, b) => a.createdAt - b.createdAt)
                    .filter((reply) => !hideCommentIds.includes(reply.id))
                    .map((reply) => (
                      <WorkCommentResponse
                        key={reply.id}
                        userId={reply.user?.id ?? ""}
                        isMine={reply.user?.id === appContext.userId}
                        createdAt={reply.createdAt}
                        stickerImageURL={reply.sticker?.imageUrl ?? ""}
                        stickerTitle={reply.sticker?.title}
                        stickerId={reply.sticker?.id}
                        stickerAccessType={reply.sticker?.accessType}
                        isStickerDownloadable={reply.sticker?.isDownloaded}
                        isDisabledCommentLike={!appContext.isLoggedIn}
                        isWorkOwnerLiked={reply.isWorkOwnerLiked}
                        workOwnerIconImageURL={withIconUrlFallback(
                          props.workOwnerIconImageURL,
                        )}
                        isNowLiked={likedCommentIds.includes(reply.id)}
                        isLiked={
                          reply.isLiked &&
                          !canceledCommentIds.includes(reply.id)
                        }
                        isMuted={Boolean(reply.isMuted)}
                        isSensitive={Boolean(reply.isSensitive)}
                        likesCount={
                          reply.likesCount -
                          (canceledCommentIds.includes(reply.id) ? 1 : 0)
                        }
                        onCreateCommentLike={() =>
                          onCreateCommentLike(reply.id)
                        }
                        onDeleteCommentLike={() =>
                          onDeleteCommentLike(reply.id)
                        }
                        text={reply.text}
                        userIconImageURL={withIconUrlFallback(
                          reply.user?.iconUrl,
                        )}
                        userName={reply.user?.name}
                        replyId={reply.id}
                        targetCommentId={comment.id}
                        iconUrl={withIconUrlFallback(userIcon)}
                        onDeleteComment={() => {
                          onDeleteComment(reply.id)
                        }}
                        isWorkOwnerBlocked={props.isWorkOwnerBlocked}
                        onReplyCompleted={(
                          id: string,
                          text: string,
                          _stickerId: string,
                          stickerImageURL: string,
                        ) => {
                          // 表示コメントを追加
                          setNewReplyComments([
                            ...newReplyComments,
                            {
                              replyTargetId: comment.id,
                              id: id,
                              text: text,
                              createdAt: Date.now(),
                              likesCount: 0,
                              isWorkOwnerLiked: false,
                              isLiked: false,
                              isMuted: false,
                              isSensitive: false, // TODO: Get this value from ReplyCommentInput
                              user: {
                                id: appContext.userId ?? "",
                                name: appContext.displayName ?? "",
                                iconUrl: withIconUrlFallback(userIcon),
                              },
                              sticker: {
                                image: {
                                  downloadURL: stickerImageURL,
                                },
                              },
                            },
                          ])
                        }}
                      />
                    ))}
              </div>
            ))}
          </ExpansionTransition>
        )}
      </div>
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, url: string) => {
          await sendComment(comment, stickerId, url, props.workId, userIcon)
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />
    </>
  )
}

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      id
      iconUrl
    }
  }`,
)

export const CommentListItemFragment = graphql(
  `fragment Comment on CommentNode @_unmask {
      ...WorkComment
      responses(offset: 0, limit: 128) {
        ...WorkComment
      }
  }`,
  [WorkCommentFragment],
)

const createWorkCommentMutation = graphql(
  `
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      ...WorkComment
    }
  }
`,
  [WorkCommentFragment],
)

const createCommentLikeMutation = graphql(
  `mutation CreateCommentLike($input: CreateCommentLikeInput!) {
    createCommentLike(input: $input) {
      id
    }
  }`,
)

const deleteCommentLikeMutation = graphql(
  `mutation DeleteCommentLike($input: DeleteCommentLikeInput!) {
    deleteCommentLike(input: $input) {
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
      userStickers(offset: 0, limit: 5, orderBy: DATE_USED) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)
