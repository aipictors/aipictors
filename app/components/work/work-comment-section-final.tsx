import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Badge } from "~/components/ui/badge"
import { WorkCommentInput } from "~/components/work/work-comment-input"
import { StickerDialog } from "~/components/work/sticker-dialog"
import { StickerInfoDialog } from "~/components/work/sticker-info-dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useMutation, useQuery } from "@apollo/client/index"
import {
  MessageCircle,
  Heart,
  ThumbsUp,
  MoreVertical,
  Reply,
  Loader2Icon,
  Eye,
  EyeOff,
  ArrowDownToLine,
  StampIcon,
} from "lucide-react"
import { useState, useContext, useRef, useEffect } from "react"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { useTranslation } from "~/hooks/use-translation"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { toast } from "sonner"
import { cn } from "~/lib/utils"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { useBoolean } from "usehooks-ts"

type Comment = {
  id: string
  user?: {
    id: string
    name: string
    iconUrl?: string | null
  }
  text?: string | null
  createdAt: number
  likesCount: number
  isLiked: boolean
  isWorkOwnerLiked: boolean
  isMuted?: boolean
  isSensitive?: boolean
  sticker?: {
    id: string
    title: string
    imageUrl?: string | null
    accessType: string
    isDownloaded?: boolean
  }
  responses?: Array<{
    id: string
    user?: {
      id: string
      name: string
      iconUrl?: string | null
    }
    text?: string | null
    createdAt: number
    likesCount: number
    isLiked: boolean
    isWorkOwnerLiked: boolean
    isMuted?: boolean
    isSensitive?: boolean
    sticker?: {
      id: string
      title: string
      imageUrl?: string | null
      accessType: string
      isDownloaded?: boolean
    }
  }>
}

type Props = {
  workId: string
  comments: Comment[]
  workOwnerIconImageURL?: string | null
  isWorkOwnerBlocked?: boolean
  isFixedInput?: boolean
}

/**
 * 作品コメントセクション（拡張版 - 返信機能とスタンプダウンロード対応）
 */
export function WorkCommentSectionEnhanced(props: Props) {
  const authContext = useContext(AuthContext)
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()
  const t = useTranslation()

  const [comment, setComment] = useState("")
  const [isSensitive, setIsSensitive] = useState(false)
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [canceledCommentIds, setCanceledCommentIds] = useState<string[]>([])
  const [showSensitiveIds, setShowSensitiveIds] = useState<string[]>([])
  const [showMutedIds, setShowMutedIds] = useState<string[]>([])
  const [openReplyIds, setOpenReplyIds] = useState<string[]>([])
  const [newComments, setNewComments] = useState<Comment[]>([])
  const [newReplies, setNewReplies] = useState<
    Array<Comment["responses"][0] & { parentId: string }>
  >([])

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [createWorkComment, { loading: isCreatingWorkComment }] = useMutation(
    createWorkCommentMutation,
  )

  const [createCommentLike, { loading: isCreatingCommentLike }] = useMutation(
    createCommentLikeMutation,
  )

  const [deleteCommentLike, { loading: isDeletingCommentLike }] = useMutation(
    deleteCommentLikeMutation,
  )

  const userResp = useQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: authContext.userId ?? "0",
    },
  })

  const userIcon = userResp?.data?.user?.iconUrl

  // 新しいコメントの送信
  const sendComment = async (
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => {
    try {
      const res = await createWorkComment({
        variables: {
          input: {
            workId: props.workId,
            text: text,
            stickerId: stickerId,
          },
        },
      })

      setComment("")
      setIsSensitive(false)

      if (res.data?.createWorkComment) {
        const newComment: Comment = {
          id: res.data.createWorkComment.id,
          text: text,
          createdAt: Date.now() / 1000,
          likesCount: 0,
          isLiked: false,
          isWorkOwnerLiked: false,
          user: {
            id: authContext.userId ?? "",
            name: authContext.displayName ?? "",
            iconUrl: userIcon,
          },
          sticker: stickerId
            ? {
                id: stickerId,
                title: "",
                imageUrl: stickerImageURL,
                accessType: "PUBLIC",
                isDownloaded: true,
              }
            : undefined,
          responses: [],
        }

        setNewComments([...newComments, newComment])
      }
    } catch (error) {
      // エラーハンドリング
      console.error("Failed to send comment:", error)
    }
  }

  // コメントを送信
  const onComment = async () => {
    const inputComment = comment.trim()

    if (inputComment === "") {
      toast(t("コメントを入力してください", "Please enter a comment"))
      return
    }

    sendComment(inputComment, "", "")
  }

  // いいね機能
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
      // エラーハンドリング
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
      // エラーハンドリング
    }
  }

  // 返信の切り替え
  const toggleReply = (commentId: string) => {
    if (openReplyIds.includes(commentId)) {
      setOpenReplyIds(openReplyIds.filter((id) => id !== commentId))
    } else {
      setOpenReplyIds([...openReplyIds, commentId])
    }
  }

  // センシティブコメント表示の切り替え
  const toggleSensitiveComment = (commentId: string) => {
    if (showSensitiveIds.includes(commentId)) {
      setShowSensitiveIds(showSensitiveIds.filter((id) => id !== commentId))
    } else {
      setShowSensitiveIds([...showSensitiveIds, commentId])
    }
  }

  // ミュートコメント表示の切り替え
  const toggleMutedComment = (commentId: string) => {
    if (showMutedIds.includes(commentId)) {
      setShowMutedIds(showMutedIds.filter((id) => id !== commentId))
    } else {
      setShowMutedIds([...showMutedIds, commentId])
    }
  }

  // 返信完了のハンドリング
  const onReplyCompleted = (
    parentId: string,
    id: string,
    text: string,
    stickerId: string,
    stickerImageURL: string,
  ) => {
    const newReply = {
      id,
      text,
      createdAt: Date.now() / 1000,
      likesCount: 0,
      isLiked: false,
      isWorkOwnerLiked: false,
      user: {
        id: authContext.userId ?? "",
        name: authContext.displayName ?? "",
        iconUrl: userIcon,
      },
      sticker: stickerId
        ? {
            id: stickerId,
            title: "",
            imageUrl: stickerImageURL,
            accessType: "PUBLIC",
            isDownloaded: true,
          }
        : undefined,
      parentId,
    }

    setNewReplies([...newReplies, newReply])
    setOpenReplyIds(openReplyIds.filter((id) => id !== parentId))
  }

  // コメントのレンダリング
  const renderComment = (comment: Comment, isReply = false) => {
    const isLiked = comment.isLiked && !canceledCommentIds.includes(comment.id)
    const isNowLiked = likedCommentIds.includes(comment.id)
    const actualLikesCount =
      comment.likesCount +
      (isNowLiked ? 1 : 0) -
      (canceledCommentIds.includes(comment.id) ? 1 : 0)

    // センシティブコメントの処理
    if (comment.isSensitive && !showSensitiveIds.includes(comment.id)) {
      return (
        <div
          key={comment.id}
          className={cn(
            "flex items-center space-x-4 rounded-lg border p-3",
            isReply && "ml-8",
          )}
        >
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
            onClick={() => toggleSensitiveComment(comment.id)}
          >
            <Eye className="mr-2 size-4" />
            {t("表示", "Show")}
          </Button>
        </div>
      )
    }

    // ミュートコメントの処理
    if (comment.isMuted && !showMutedIds.includes(comment.id)) {
      return (
        <div
          key={comment.id}
          className={cn(
            "flex items-center space-x-4 rounded-lg border p-3",
            isReply && "ml-8",
          )}
        >
          <EyeOff className="size-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm">
              {t(
                "ミュートしているユーザのコメントです",
                "This is a comment from a muted user",
              )}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleMutedComment(comment.id)}
          >
            <Eye className="mr-2 size-4" />
            {t("表示", "Show")}
          </Button>
        </div>
      )
    }

    return (
      <div
        key={comment.id}
        className={cn(
          "group rounded-lg border bg-background p-4 transition-all hover:shadow-md",
          isReply && "ml-8 border-l-4 border-l-blue-200",
        )}
      >
        <div className="flex items-start space-x-3">
          <Link to={`/users/${comment.user?.id}`}>
            <Avatar className="size-10">
              <AvatarImage
                src={withIconUrlFallback(comment.user?.iconUrl)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
          </Link>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Link
                to={`/users/${comment.user?.id}`}
                className="font-medium hover:underline"
              >
                {comment.user?.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {toDateTimeText(comment.createdAt, true)}
              </span>
              {comment.isWorkOwnerLiked && (
                <div className="relative">
                  <Avatar className="size-4">
                    <AvatarImage
                      src={withIconUrlFallback(props.workOwnerIconImageURL)}
                      alt=""
                    />
                    <AvatarFallback />
                  </Avatar>
                  <Heart className="absolute -right-1 -bottom-1 size-3 fill-rose-500 text-rose-500" />
                </div>
              )}
            </div>

            {comment.text && (
              <p className="whitespace-pre-wrap break-words text-sm">
                {comment.text}
              </p>
            )}

            {comment.sticker?.imageUrl && (
              <div className="inline-block">
                {comment.sticker.accessType === "PUBLIC" ? (
                  <StickerInfoDialog
                    isDownloaded={comment.sticker.isDownloaded ?? false}
                    stickerId={comment.sticker.id}
                    title={comment.sticker.title}
                    imageUrl={comment.sticker.imageUrl}
                  >
                    <img
                      className="w-32 cursor-pointer transition-transform hover:scale-105"
                      src={comment.sticker.imageUrl}
                      alt={comment.sticker.title}
                    />
                  </StickerInfoDialog>
                ) : (
                  <img
                    className="w-32"
                    src={comment.sticker.imageUrl}
                    alt={comment.sticker.title}
                  />
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={
                  isLiked || isNowLiked
                    ? () => onDeleteCommentLike(comment.id)
                    : () => onCreateCommentLike(comment.id)
                }
                disabled={!authContext.isLoggedIn}
                className="flex items-center space-x-1 text-xs"
              >
                <ThumbsUp
                  className={cn(
                    "size-4",
                    (isLiked || isNowLiked) && "fill-blue-500 text-blue-500",
                  )}
                />
                {actualLikesCount > 0 && <span>{actualLikesCount}</span>}
              </Button>

              {!isReply && !props.isWorkOwnerBlocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReply(comment.id)}
                  className="flex items-center space-x-1 text-xs"
                >
                  <Reply className="size-4" />
                  <span>{t("返信", "Reply")}</span>
                </Button>
              )}

              {comment.sticker?.imageUrl &&
                comment.sticker.accessType === "PUBLIC" && (
                  <StickerInfoDialog
                    isDownloaded={comment.sticker.isDownloaded ?? false}
                    stickerId={comment.sticker.id}
                    title={comment.sticker.title}
                    imageUrl={comment.sticker.imageUrl}
                  >
                    <Button variant="ghost" size="sm" className="text-xs">
                      <ArrowDownToLine className="size-4" />
                    </Button>
                  </StickerInfoDialog>
                )}
            </div>
          </div>
        </div>

        {/* 返信入力欄 */}
        {openReplyIds.includes(comment.id) && (
          <div className="mt-4">
            <WorkCommentInput
              targetCommentId={comment.id}
              onReplyCompleted={(id, text, stickerId, stickerImageURL) =>
                onReplyCompleted(
                  comment.id,
                  id,
                  text,
                  stickerId,
                  stickerImageURL,
                )
              }
              isWorkOwnerBlocked={props.isWorkOwnerBlocked}
            />
          </div>
        )}

        {/* 返信の表示 */}
        {comment.responses && comment.responses.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.responses.map((reply) => renderComment(reply, true))}
          </div>
        )}

        {/* 新しい返信の表示 */}
        {newReplies
          .filter((reply) => reply.parentId === comment.id)
          .map((reply) => renderComment(reply, true))}
      </div>
    )
  }

  const allComments = [...props.comments, ...newComments]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="size-5" />
            <h3 className="font-semibold">
              {t("コメント", "Comments")} ({allComments.length})
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {props.isWorkOwnerBlocked && (
          <div className="rounded-md bg-gray-100 p-3 text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
            {t(
              "ブロック中のユーザーにはコメントできません",
              "Cannot comment to blocked users",
            )}
          </div>
        )}

        {/* コメント入力欄 */}
        {!props.isWorkOwnerBlocked && !props.isFixedInput && (
          <div className="space-y-2">
            <div className="flex w-full items-center space-x-3">
              <Avatar>
                <AvatarImage src={withIconUrlFallback(userIcon)} alt="" />
                <AvatarFallback />
              </Avatar>
              <AutoResizeTextarea
                onChange={(event) => setComment(event.target.value)}
                value={comment}
                placeholder={t("コメントする", "Add a comment")}
                disabled={!authContext.isLoggedIn}
                className="flex-1"
              />
              <Button
                disabled={!authContext.isLoggedIn}
                variant="secondary"
                size="icon"
                onClick={onOpen}
              >
                <StampIcon className="size-4" />
              </Button>
              {isCreatingWorkComment ? (
                <Button disabled>
                  <Loader2Icon className="size-4 animate-spin" />
                </Button>
              ) : (
                <Button disabled={!authContext.isLoggedIn} onClick={onComment}>
                  {t("送信", "Send")}
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2 pl-14 text-xs text-muted-foreground">
              <Checkbox
                id="sensitive-checkbox"
                checked={isSensitive}
                onCheckedChange={(checked: boolean) =>
                  setIsSensitive(checked === true)
                }
                disabled={!authContext.isLoggedIn}
              />
              <label htmlFor="sensitive-checkbox">
                {t("隠し付き", "Sensitive comment")}
              </label>
              <CrossPlatformTooltip
                text={t(
                  "初期表示は非表示になります。クリックで表示されます。",
                  "Initially hidden from view. Click to display.",
                )}
              />
            </div>
          </div>
        )}

        {/* コメント一覧 */}
        <ScrollArea className="max-h-96 overflow-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {allComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="size-12 mx-auto mb-2 opacity-50" />
                <p>{t("まだコメントはありません", "No comments yet")}</p>
                <p className="text-xs">
                  {t(
                    "最初のコメントを投稿してみましょう！",
                    "Be the first to comment!",
                  )}
                </p>
              </div>
            ) : (
              allComments.map((comment) => renderComment(comment))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* スタンプダイアログ */}
      <StickerDialog
        isOpen={isOpen}
        onClose={onClose}
        onSend={async (stickerId: string, url: string) => {
          await sendComment(comment, stickerId, url)
        }}
        isTargetUserBlocked={props.isWorkOwnerBlocked}
      />
    </Card>
  )
}

const createWorkCommentMutation = graphql(
  `mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }`,
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

const userQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      id
      iconUrl
    }
  }`,
)
