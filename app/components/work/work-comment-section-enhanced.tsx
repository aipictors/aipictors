import { useState, useContext, type ChangeEvent } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Textarea } from "~/components/ui/textarea"
import {
  MessageCircle,
  Heart,
  Reply,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Send,
  Smile,
  ThumbsUp,
} from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { cn } from "~/lib/utils"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

type CommentData = {
  id: string
  text?: string | null
  createdAt: number
  isLiked: boolean
  likesCount: number
  isWorkOwnerLiked: boolean
  user?: {
    id: string
    name?: string | null
    iconUrl?: string | null
  } | null
  sticker?: {
    id?: string | null
    imageUrl?: string | null
    title?: string | null
  } | null
  responses?: CommentData[] | null
}

type Props = {
  workId: string
  workOwnerIconImageURL?: string | null
  comments: CommentData[]
  defaultShowCommentCount?: number
  isWorkOwnerBlocked?: boolean
  isCompact?: boolean
}

/**
 * 作品ダイアログ専用のコメント欄コンポーネント
 * より見やすく、アクセスしやすいUIを提供
 */
export function WorkCommentSection (props: Props): React.ReactNode {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [comment, setComment] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)

  const displayComments = showAllComments
    ? props.comments
    : props.comments.slice(0, props.defaultShowCommentCount || 3)

  const hasMoreComments =
    props.comments.length > (props.defaultShowCommentCount || 3)

  const handleSendComment = () => {
    if (comment.trim()) {
      // コメント送信処理をここに実装
      setComment("")
      setIsExpanded(false)
    }
  }

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    // 自動でテキストエリアの高さを調整
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="space-y-4">
      {/* コメント数とヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">
            {t("コメント", "Comments")}{" "}
            {props.comments.length > 0 && (
              <span className="text-muted-foreground">
                ({props.comments.length})
              </span>
            )}
          </span>
        </div>
        {hasMoreComments && !showAllComments && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllComments(true)}
            className="text-xs"
          >
            {t("すべて表示", "Show all")} ({props.comments.length})
          </Button>
        )}
      </div>

      {/* コメント入力欄 - モダンなデザイン */}
      {!props.isWorkOwnerBlocked && authContext.isLoggedIn && (
        <Card className="border-0 bg-muted/30 shadow-none transition-all hover:bg-muted/40">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background">
                <AvatarImage
                  src={withIconUrlFallback(authContext.avatarPhotoURL)}
                  alt={authContext.displayName || ""}
                />
                <AvatarFallback>
                  {authContext.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder={t(
                    "作品にコメントを残そう...",
                    "Share your thoughts on this work...",
                  )}
                  value={comment}
                  onChange={handleTextareaChange}
                  className="min-h-[2.8rem] resize-none border-0 bg-background/50 p-3 text-sm placeholder:text-muted-foreground/70 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/50"
                  onFocus={() => setIsExpanded(true)}
                  rows={isExpanded ? 3 : 1}
                />
                {isExpanded && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      <span className="text-muted-foreground text-xs">
                        {comment.length}/500
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false)
                          setComment("")
                        }}
                        className="text-xs"
                      >
                        {t("キャンセル", "Cancel")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendComment}
                        disabled={!comment.trim() || comment.length > 500}
                        className="h-8 text-xs"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        {t("コメント", "Comment")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* コメント一覧 */}
      {props.comments.length > 0 ? (
        <div className="space-y-3">
          {displayComments.map((comment, index) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              isCompact={props.isCompact}
              isFirst={index === 0}
            />
          ))}

          {hasMoreComments && !showAllComments && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="text-xs"
              >
                <ChevronDown className="mr-1 h-3 w-3" />
                {t("他のコメントを見る", "View more comments")} (
                {props.comments.length - displayComments.length})
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            {t("まだコメントがありません", "No comments yet")}
          </p>
          <p className="text-muted-foreground/70 text-xs">
            {t(
              "最初にコメントしてみませんか？",
              "Be the first to leave a comment!",
            )}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 個別コメントカードコンポーネント
 */
function CommentCard({
  comment,
  isCompact = false,
  isFirst = false,
}: {
  comment: CommentData
  isCompact?: boolean
  isFirst?: boolean
}) {
  const t = useTranslation()
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likesCount, setLikesCount] = useState(comment.likesCount)
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <Card
      className={cn(
        "border-0 bg-transparent shadow-none transition-all hover:bg-muted/20",
        isFirst && "mt-0",
      )}
    >
      <CardContent className="p-0">
        <div className="flex gap-3">
          {/* ユーザーアバター */}
          <Avatar
            className={cn(
              "flex-shrink-0 ring-2 ring-background",
              isCompact ? "h-7 w-7" : "h-9 w-9",
            )}
          >
            <AvatarImage
              src={withIconUrlFallback(comment.user?.iconUrl)}
              alt={comment.user?.name || ""}
            />
            <AvatarFallback>{comment.user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* ユーザー名と時刻 */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "font-medium text-foreground",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                {comment.user?.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {toDateTimeText(comment.createdAt, true)}
              </span>
              {comment.isWorkOwnerLiked && (
                <Badge
                  variant="secondary"
                  className="h-5 px-2 font-medium text-xs"
                >
                  <Heart className="mr-1 h-2.5 w-2.5 fill-current text-red-500" />
                  {t("作者", "Creator")}
                </Badge>
              )}
            </div>

            {/* コメント本文 */}
            {comment.text && (
              <div
                className={cn(
                  "mb-3 rounded-2xl bg-muted/40 px-4 py-3",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                <p className="break-words text-foreground leading-relaxed">
                  {comment.text}
                </p>
              </div>
            )}

            {/* スタンプ */}
            {comment.sticker?.imageUrl && (
              <div className="mb-3">
                <img
                  src={comment.sticker.imageUrl}
                  alt={comment.sticker.title || "Sticker"}
                  className="h-20 w-20 rounded-lg object-contain shadow-sm"
                />
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                className={cn(
                  "h-7 px-2 text-xs",
                  isLiked
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                <ThumbsUp
                  className={cn("mr-1 h-3 w-3", isLiked && "fill-current")}
                />
                {likesCount > 0 && (
                  <span className="font-medium">{likesCount}</span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="h-7 px-2 text-muted-foreground text-xs hover:text-primary"
              >
                <Reply className="mr-1 h-3 w-3" />
                {t("返信", "Reply")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {/* 返信一覧 */}
            {comment.responses && comment.responses.length > 0 && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="h-6 px-0 text-primary text-xs hover:text-primary/80"
                >
                  {showReplies ? (
                    <ChevronUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  )}
                  {showReplies
                    ? t("返信を隠す", "Hide replies")
                    : t("返信を表示", "View replies")}{" "}
                  ({comment.responses.length})
                </Button>

                {showReplies && (
                  <div className="mt-3 space-y-3">
                    {comment.responses.map((reply) => (
                      <div
                        key={reply.id}
                        className="ml-6 border-muted border-l-2 pl-4"
                      >
                        <CommentCard comment={reply} isCompact={true} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 返信入力欄 */}
            {showReplyInput && (
              <div className="mt-3 ml-6 border-muted border-l-2 pl-4">
                <div className="flex gap-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={withIconUrlFallback(null)} alt="" />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder={t("返信を書く...", "Write a reply...")}
                      className="min-h-[2rem] resize-none border-0 bg-muted/30 p-2 text-xs focus-visible:bg-background"
                      rows={2}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplyInput(false)}
                        className="h-6 px-2 text-xs"
                      >
                        {t("キャンセル", "Cancel")}
                      </Button>
                      <Button size="sm" className="h-6 px-2 text-xs">
                        {t("返信", "Reply")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
