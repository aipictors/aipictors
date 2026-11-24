import { SmilePlus } from "lucide-react"
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { postAsViewer } from "~/lib/viewer-request-headers"
import type {
  CommentReactionEntry,
  CommentReactionMap,
} from "~/routes/api.comment-reactions/route"

/** 付けられるリアクション（aipictors-api の COMMENT_REACTIONS と同じ。👍 はいいねがあるので入れない） */
const COMMENT_REACTIONS = ["❤️", "✨", "😂", "😮", "🙏", "🎉"]

type CommentReactionsState = {
  reactions: CommentReactionMap
  busyCommentId: string | null
  react: (commentId: string, emoji: string) => Promise<void>
}

const CommentReactionsContext = createContext<CommentReactionsState | null>(
  null,
)

/**
 * コメント一覧のリアクションをまとめて読む（コメントと返信の ID で 1 回）
 */
export function CommentReactionsProvider(props: {
  commentIds: string[]
  children: ReactNode
}) {
  const t = useTranslation()
  const [reactions, setReactions] = useState<CommentReactionMap>({})
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null)
  const idsKey = Array.from(new Set(props.commentIds)).sort().join(",")

  useEffect(() => {
    if (idsKey === "") return
    let canceled = false
    fetch("/api/comment-reactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ op: "list", commentIds: idsKey.split(",") }),
    })
      .then(
        (response) => response.json() as Promise<{ data?: CommentReactionMap }>,
      )
      .then((json) => {
        if (!canceled && json.data) {
          setReactions((current) => ({ ...current, ...json.data }))
        }
      })
      // 読めなくてもコメントはそのまま見られる
      .catch(() => {})
    return () => {
      canceled = true
    }
  }, [idsKey])

  const react = async (commentId: string, emoji: string) => {
    setBusyCommentId(commentId)
    try {
      const response = await postAsViewer("/api/comment-reactions", {
        op: "react",
        commentId,
        emoji,
      })
      const json = (await response.json().catch(() => null)) as {
        error?: string | null
        data?: CommentReactionEntry[] | null
      } | null
      if (!response.ok || !json?.data) {
        toast(
          json?.error ?? t("リアクションできませんでした", "Failed to react"),
        )
        return
      }
      const entries = json.data
      setReactions((current) => ({ ...current, [commentId]: entries }))
    } catch {
      toast(t("リアクションできませんでした", "Failed to react"))
    } finally {
      setBusyCommentId(null)
    }
  }

  return (
    <CommentReactionsContext.Provider
      value={{ reactions, busyCommentId, react }}
    >
      {props.children}
    </CommentReactionsContext.Provider>
  )
}

/**
 * コメントについたリアクションと、付けるボタン（スタンプを送るほどでもないときに ❤️ などを 1 つ付ける。もう一度押すと外す）
 * 自分のコメントには付けられない（付いたものは見える）
 */
export function CommentReactions(props: {
  commentId: string
  isMine: boolean
}) {
  const t = useTranslation()
  const state = useContext(CommentReactionsContext)
  const authContext = useContext(AuthContext)
  const [open, setOpen] = useState(false)
  if (state === null) return null

  const entries = state.reactions[props.commentId] ?? []
  const viewerId = authContext.userId
  const myEmoji =
    entries.find(
      (entry) => viewerId !== null && entry.userIds.includes(viewerId),
    )?.emoji ?? null
  const canReact = authContext.isLoggedIn && !props.isMine
  const busy = state.busyCommentId === props.commentId

  const react = (emoji: string) => {
    setOpen(false)
    void state.react(props.commentId, emoji === myEmoji ? "" : emoji)
  }

  if (entries.length === 0 && !canReact) return null

  return (
    <div className="flex items-center gap-1">
      {entries.map((entry) => (
        <button
          key={entry.emoji}
          type="button"
          disabled={!canReact || busy}
          onClick={() => react(entry.emoji)}
          aria-label={
            entry.emoji === myEmoji
              ? t("リアクションを外す", "Remove reaction")
              : t("リアクション", "Reaction")
          }
          className={cn(
            "flex h-6 items-center gap-0.5 rounded-full border px-1.5 text-xs disabled:cursor-default",
            entry.emoji === myEmoji && "border-primary bg-primary/10",
          )}
        >
          <span>{entry.emoji}</span>
          <span className="tabular-nums">{entry.userIds.length}</span>
        </button>
      ))}
      {canReact && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={busy}
              aria-label={t("リアクションする", "React")}
              className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted hover:text-foreground"
            >
              <SmilePlus className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="flex w-auto gap-1 rounded-full p-1">
            {COMMENT_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => react(emoji)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-lg hover:bg-muted",
                  emoji === myEmoji && "bg-primary/10",
                )}
              >
                {emoji}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
