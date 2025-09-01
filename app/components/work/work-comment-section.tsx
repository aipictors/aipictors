import { useState, useContext } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Badge } from "~/components/ui/badge"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "~/components/ui/collapsible"
import {
  MessageCircle,
  Heart,
  Reply,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Send,
  Smile,
} from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { cn } from "~/lib/utils"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"

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
export function WorkCommentSection(props: Props) {
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
    }
  }

  return (
    <div className="space-y-4">
      {/* コメント数表示 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {t("コメント", "Comments")} ({props.comments.length})
          </span>
        </div>
        {hasMoreComments && !showAllComments && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllComments(true)}
            className="text-xs"
          >
            {t("すべて表示", "Show all")}
          </Button>
        )}
      </div>

      {/* コメント入力欄 - コンパクト版 */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={withIconUrlFallback(authContext.avatarPhotoURL)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
            <div className="flex-1 space-y-2">
              <AutoResizeTextarea
                placeholder={t("コメントを追加...", "Add a comment...")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[2.5rem] resize-none border-0 p-0 text-sm focus-visible:ring-0"
                onFocus={() => setIsExpanded(true)}
              />
              {isExpanded && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
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
                      onClick={handleSendComment}
                      disabled={!comment.trim()}
                      className="h-8"
                    >
                      <Send className="mr-1 h-3 w-3" />
                      {t("送信", "Send")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* コメント一覧 */}
      <ScrollArea className="h-[calc(100vh-20rem)] pr-2">
        <div className="space-y-3">
          {displayComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              workOwnerIconImageURL={props.workOwnerIconImageURL}
              isCompact={props.isCompact}
            />
          ))}
        </div>

        {hasMoreComments &&
          showAllComments &&
          props.comments.length > displayComments.length && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm">
                <ChevronDown className="mr-1 h-4 w-4" />
                {t("さらに読み込む", "Load more")}
              </Button>
            </div>
          )}
      </ScrollArea>
    </div>
  )
}

/**
 * 個別コメントカードコンポーネント
 */
function CommentCard({
  comment,
  isCompact = false,
}: {
  comment: CommentData
  workOwnerIconImageURL?: string | null
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
    <Card className="border-0 bg-muted/30 shadow-none">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* ユーザーアバター */}
          <Avatar
            className={cn("flex-shrink-0", isCompact ? "h-6 w-6" : "h-8 w-8")}
          >
            <AvatarImage
              src={withIconUrlFallback(comment.user?.iconUrl)}
              alt=""
            />
            <AvatarFallback />
          </Avatar>

          <div className="min-w-0 flex-1">
            {/* ユーザー名と時刻 */}
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "truncate font-medium",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                {comment.user?.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {toDateTimeText(comment.createdAt, true)}
              </span>
              {comment.isWorkOwnerLiked && (
                <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                  <Heart className="mr-0.5 h-2.5 w-2.5 fill-current text-red-500" />
                  {t("作者", "Creator")}
                </Badge>
              )}
            </div>

            {/* コメント本文 */}
            {comment.text && (
              <p
                className={cn(
                  "break-words text-muted-foreground",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                {comment.text}
              </p>
            )}

            {/* スタンプ */}
            {comment.sticker?.imageUrl && (
              <div className="mt-2">
                <img
                  src={comment.sticker.imageUrl}
                  alt=""
                  className="h-16 w-16 rounded object-contain"
                />
              </div>
            )}

            {/* アクションボタン */}
            <div className="mt-2 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                className={cn("h-6 px-2 text-xs", isLiked && "text-red-500")}
              >
                <Heart
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
              <Collapsible open={showReplies} onOpenChange={setShowReplies}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 px-0 text-muted-foreground text-xs"
                  >
                    {showReplies ? (
                      <ChevronUp className="mr-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="mr-1 h-3 w-3" />
                    )}
                    {t("返信を表示", "Show replies")} (
                    {comment.responses.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {comment.responses.map((reply) => (
                    <div
                      key={reply.id}
                      className="ml-4 border-muted border-l-2 pl-3"
                    >
                      <CommentCard comment={reply} isCompact={true} />
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
