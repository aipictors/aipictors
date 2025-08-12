import { useState, useContext } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Textarea } from "~/components/ui/textarea"
import {
  MessageCircle,
  Heart,
  Reply,
  MoreHorizontal,
  ChevronDown,
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
 * 改良された作品ダイアログ専用コメントセクション
 */
export function WorkCommentSection(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [comment, setComment] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)

  const displayComments = showAllComments
    ? props.comments
    : props.comments.slice(0, props.defaultShowCommentCount || 4)

  const hasMoreComments =
    props.comments.length > (props.defaultShowCommentCount || 4)

  const handleSubmit = () => {
    if (comment.trim()) {
      // コメント送信処理
      setComment("")
      setIsExpanded(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">
            {t("コメント", "Comments")} ({props.comments.length})
          </span>
        </div>
        {hasMoreComments && !showAllComments && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllComments(true)}
            className="text-xs text-primary"
          >
            {t("すべて表示", "Show all")}
          </Button>
        )}
      </div>

      {/* コメント入力 */}
      {!props.isWorkOwnerBlocked && authContext.isLoggedIn && (
        <Card className="bg-muted/30 border-0 p-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={withIconUrlFallback(authContext.avatarPhotoURL)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={t("コメントを書く...", "Write a comment...")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[2.5rem] resize-none border-0 bg-background p-2 text-sm"
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 3 : 1}
              />
              {isExpanded && (
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false)
                        setComment("")
                      }}
                    >
                      {t("キャンセル", "Cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!comment.trim()}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      {t("送信", "Send")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* コメント一覧 */}
      {props.comments.length > 0 ? (
        <div className="space-y-3">
          {displayComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isCompact={props.isCompact}
            />
          ))}

          {hasMoreComments && !showAllComments && (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllComments(true)}
              >
                <ChevronDown className="mr-1 h-3 w-3" />
                {t("他のコメントを見る", "Show more")} (
                {props.comments.length - displayComments.length})
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {t("まだコメントがありません", "No comments yet")}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 個別コメントアイテム
 */
function CommentItem({
  comment,
  isCompact = false,
}: {
  comment: CommentData
  isCompact?: boolean
}) {
  const t = useTranslation()
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likesCount, setLikesCount] = useState(comment.likesCount)
  const [showReplies, setShowReplies] = useState(false)

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  return (
    <div className="flex gap-3">
      <Avatar
        className={cn("flex-shrink-0", isCompact ? "h-6 w-6" : "h-8 w-8")}
      >
        <AvatarImage src={withIconUrlFallback(comment.user?.iconUrl)} alt="" />
        <AvatarFallback />
      </Avatar>

      <div className="min-w-0 flex-1">
        {/* ヘッダー */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={cn("font-medium", isCompact ? "text-xs" : "text-sm")}
          >
            {comment.user?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {toDateTimeText(comment.createdAt, true)}
          </span>
          {comment.isWorkOwnerLiked && (
            <Badge variant="secondary" className="h-4 px-1.5 text-xs">
              <Heart className="mr-0.5 h-2.5 w-2.5 fill-current text-red-500" />
              {t("作者", "Creator")}
            </Badge>
          )}
        </div>

        {/* コンテンツ */}
        {comment.text && (
          <div
            className={cn(
              "mb-2 rounded-xl bg-muted/40 px-3 py-2",
              isCompact ? "text-xs" : "text-sm",
            )}
          >
            <p className="break-words text-foreground">{comment.text}</p>
          </div>
        )}

        {/* スタンプ */}
        {comment.sticker?.imageUrl && (
          <div className="mb-2">
            <img
              src={comment.sticker.imageUrl}
              alt=""
              className="h-16 w-16 rounded object-contain"
            />
          </div>
        )}

        {/* アクション */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            className={cn("h-6 px-2 text-xs", isLiked && "text-primary")}
          >
            <ThumbsUp
              className={cn("mr-1 h-3 w-3", isLiked && "fill-current")}
            />
            {likesCount > 0 && likesCount}
          </Button>

          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Reply className="mr-1 h-3 w-3" />
            {t("返信", "Reply")}
          </Button>

          <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* 返信 */}
        {comment.responses && comment.responses.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-5 px-0 text-xs text-primary"
            >
              <ChevronDown
                className={cn(
                  "mr-1 h-3 w-3 transition-transform",
                  showReplies && "rotate-180",
                )}
              />
              {t("返信", "Replies")} ({comment.responses.length})
            </Button>

            {showReplies && (
              <div className="mt-2 space-y-2">
                {comment.responses.map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-4 border-l-2 border-muted pl-3"
                  >
                    <CommentItem comment={reply} isCompact={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
