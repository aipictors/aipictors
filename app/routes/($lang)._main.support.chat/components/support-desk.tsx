import { Link } from "@remix-run/react"
import {
  BotIcon,
  CheckCircle2Icon,
  HeadsetIcon,
  Loader2Icon,
  PlusIcon,
  SendIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { marked } from "marked"
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { cn } from "~/lib/utils"

type SupportMessage = {
  id: string
  ticketId: string
  role: "user" | "ai" | "staff" | "system"
  body: string
  helpful: number | null
  createdAt: number
}

type SupportTicket = {
  id: string
  status: "ai" | "waiting_staff" | "staff_replied" | "resolved"
  summary: string | null
  createdAt: number
  updatedAt: number
}

type ThreadData = {
  ticket: SupportTicket | null
  messages: SupportMessage[]
  tickets?: SupportTicket[]
}

/** よくある相談（押すとそのまま送る） */
const QUICK_TOPICS = [
  "感謝コインや継続ボーナスが届いていません",
  "クレジットカードを変更したい",
  "画像の生成が失敗する・終わらない",
  "作品を投稿できません",
  "ログインできない・アカウントが別になった",
  "退会（アカウント削除）したい",
  "不快な作品を通報したい",
  "プランを解約したい",
]

const MAX_LENGTH = 4000

const STATUS_LABEL: Record<SupportTicket["status"], string> = {
  ai: "AI が回答します",
  waiting_staff: "スタッフの確認待ち",
  staff_replied: "スタッフが返信しました",
  resolved: "解決済み",
}

const callSupportApi = async <T,>(
  op: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  const response = await fetch(`/api/support/${op}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = (await response.json().catch(() => null)) as {
    error?: string | null
    data?: T
  } | null
  if (!response.ok || !json || json.error || json.data === undefined) {
    throw new Error(json?.error ?? "通信に失敗しました")
  }
  return json.data
}

/**
 * AI・スタッフの返事を表示する（HTML はそのまま出さず、Markdown のリンクや箇条書きだけ生かす）
 */
const renderBody = (text: string): string => {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
  const html = marked(escaped, { breaks: true, async: false }) as string
  return html.replaceAll(
    "<a href=",
    '<a target="_blank" rel="noopener noreferrer" href=',
  )
}

const formatTime = (epoch: number): string => {
  return new Date(epoch * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * お問い合わせ（AI がすぐ答え、必要ならスタッフが同じチャットで返事する）
 */
export function SupportDesk() {
  const authContext = useContext(AuthContext)
  const [thread, setThread] = useState<ThreadData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const ticket = thread?.ticket ?? null
  const messages = thread?.messages ?? []
  const isOpenTicket = ticket !== null && ticket.status !== "resolved"
  const isStaffHandling =
    ticket?.status === "waiting_staff" || ticket?.status === "staff_replied"

  const load = useCallback(async (ticketId?: string) => {
    try {
      const data = await callSupportApi<ThreadData>("thread", { ticketId })
      setThread(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "読み込みに失敗しました",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    void load()
  }, [authContext.isLoading, authContext.isNotLoggedIn, load])

  // スタッフ対応中は返事が来ていないかときどき確かめる
  useEffect(() => {
    if (!isStaffHandling || !ticket) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(ticket.id)
    }, 20000)
    return () => window.clearInterval(timer)
  }, [isStaffHandling, ticket, load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, pendingText])

  const send = async (
    value: string,
    options?: { escalate?: boolean; newTicket?: boolean },
  ) => {
    const body = value.trim()
    if (body.length === 0 || isSending) return
    if (body.length > MAX_LENGTH) {
      toast.error(`${MAX_LENGTH}文字以内で入力してください`)
      return
    }
    setIsSending(true)
    setPendingText(body)
    setText("")
    try {
      const data = await callSupportApi<{
        ticket: SupportTicket
        messages: SupportMessage[]
      }>("messages", {
        body,
        ticketId: options?.newTicket ? undefined : isOpenTicket ? ticket?.id : undefined,
        newTicket: options?.newTicket === true,
        escalate: options?.escalate === true,
        userName: authContext.displayName ?? undefined,
      })
      setThread((prev) => {
        const sameTicket = prev?.ticket?.id === data.ticket.id
        return {
          ticket: data.ticket,
          messages: sameTicket
            ? [...(prev?.messages ?? []), ...data.messages]
            : data.messages,
          tickets: prev?.tickets,
        }
      })
    } catch (error) {
      setText(body)
      toast.error(
        error instanceof Error ? error.message : "送信に失敗しました",
      )
    } finally {
      setPendingText(null)
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  const escalate = async () => {
    if (!ticket) return
    try {
      const data = await callSupportApi<{
        ticket: SupportTicket
        messages: SupportMessage[]
      }>("escalate", { ticketId: ticket.id })
      setThread((prev) => ({
        ticket: data.ticket,
        messages: [...(prev?.messages ?? []), ...data.messages],
        tickets: prev?.tickets,
      }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "失敗しました")
    }
  }

  const resolve = async () => {
    if (!ticket) return
    try {
      const data = await callSupportApi<{ ticket: SupportTicket }>("resolve", {
        ticketId: ticket.id,
      })
      setThread((prev) => (prev ? { ...prev, ticket: data.ticket } : prev))
      toast.success("解決済みにしました。ご利用ありがとうございました")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "失敗しました")
    }
  }

  const sendFeedback = async (message: SupportMessage, helpful: boolean) => {
    setThread((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === message.id ? { ...m, helpful: helpful ? 1 : -1 } : m,
            ),
          }
        : prev,
    )
    try {
      await callSupportApi("feedback", { messageId: message.id, helpful })
    } catch {
      // 評価が送れなくても会話は続けられるので何もしない
    }
  }

  const startNew = () => {
    setThread((prev) => ({ ticket: null, messages: [], tickets: prev?.tickets }))
    setText("")
    textareaRef.current?.focus()
  }

  const showWelcome = !isLoading && (!isOpenTicket || messages.length === 0)
  const lastAiMessageId = [...messages].reverse().find((m) => m.role === "ai")?.id

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col md:h-[calc(100dvh-5rem)]">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 border-b px-3 py-3 md:px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
          <HeadsetIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-base">お問い合わせ</h1>
          <p className="truncate text-muted-foreground text-xs">
            {ticket && isOpenTicket
              ? STATUS_LABEL[ticket.status]
              : "AI がすぐにお答えします。解決しないときはスタッフに引き継ぎます"}
          </p>
        </div>
        {ticket && (
          <Button variant="outline" size="sm" onClick={startNew}>
            <PlusIcon className="mr-1 size-4" />
            新しい相談
          </Button>
        )}
      </div>

      {/* メッセージ */}
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-4">
        {isLoading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        )}

        {showWelcome && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
              <p className="font-bold">こんにちは！Aipictors のサポートです</p>
              <p className="mt-1 text-muted-foreground">
                あなたのプランやコイン、最近の生成の記録を確認しながらお答えします。返金やコインの付与、不具合の調査など、AI
                で対応できないものはスタッフに引き継ぎ、このチャットでお返事します（Discord
                に登録しなくても大丈夫です）。
              </p>
            </div>
            <div>
              <p className="mb-2 font-medium text-muted-foreground text-xs">
                よくある相談
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    disabled={isSending}
                    onClick={() => void send(topic, { newTicket: true })}
                    className="rounded-full border bg-background px-3 py-1.5 text-left text-sm transition hover:border-sky-400 hover:bg-sky-500/5 disabled:opacity-50"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              使い方は
              <Link to="/help" className="mx-1 underline">
                ヘルプ
              </Link>
              、プランやお支払いは
              <Link to="/plus" className="mx-1 underline">
                Aipictors+ のページ
              </Link>
              にもまとまっています。
            </p>
          </div>
        )}

        {isOpenTicket &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              showFeedback={message.id === lastAiMessageId && !isStaffHandling}
              onFeedback={(helpful) => void sendFeedback(message, helpful)}
              onEscalate={() => void escalate()}
            />
          ))}

        {pendingText !== null && (
          <>
            <div className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-sky-600 px-3.5 py-2 text-sm text-white opacity-70">
                {pendingText}
              </div>
            </div>
            {!isStaffHandling && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <BotIcon className="size-4" />
                <span>確認しています…</span>
                <Loader2Icon className="size-4 animate-spin" />
              </div>
            )}
          </>
        )}

        {ticket?.status === "resolved" && messages.length > 0 && (
          <p className="text-center text-muted-foreground text-xs">
            前回のお問い合わせは解決済みです。新しく書くと新しい相談になります
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力 */}
      <div className="border-t bg-background px-3 pt-2 pb-3 md:px-4">
        {isOpenTicket && messages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {!isStaffHandling && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void escalate()}
              >
                <HeadsetIcon className="mr-1 size-4" />
                スタッフに相談する
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => void resolve()}>
              <CheckCircle2Icon className="mr-1 size-4" />
              解決した
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder={
              isStaffHandling
                ? "スタッフへの追加のメッセージ"
                : "困っていることを書いてください（例: コインが減った、投稿できない）"
            }
            onChange={(event) => {
              setText(event.target.value)
              event.target.style.height = "auto"
              event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !isComposing &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                void send(text)
              }
            }}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-sky-400"
          />
          <Button
            size="icon"
            className="size-11 shrink-0 rounded-xl"
            disabled={isSending || text.trim().length === 0}
            onClick={() => void send(text)}
            aria-label="送信"
          >
            {isSending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Enter で送信・Shift+Enter で改行。パスワードやカード番号は書かないでください
        </p>
      </div>
    </div>
  )
}

function MessageBubble(props: {
  message: SupportMessage
  showFeedback: boolean
  onFeedback: (helpful: boolean) => void
  onEscalate: () => void
}) {
  const { message } = props

  if (message.role === "system") {
    return (
      <div className="mx-auto max-w-[90%] rounded-lg bg-amber-500/10 px-3 py-2 text-center text-amber-900 text-xs leading-relaxed dark:text-amber-200">
        {message.body}
      </div>
    )
  }

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-sky-600 px-3.5 py-2 text-sm text-white">
          {message.body}
        </div>
        <span className="mt-1 text-[11px] text-muted-foreground">
          {formatTime(message.createdAt)}
        </span>
      </div>
    )
  }

  const isStaff = message.role === "staff"

  return (
    <div className="flex gap-2">
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          isStaff
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            : "bg-sky-500/15 text-sky-600 dark:text-sky-300",
        )}
      >
        {isStaff ? (
          <HeadsetIcon className="size-4" />
        ) : (
          <BotIcon className="size-4" />
        )}
      </div>
      <div className="min-w-0 max-w-[85%]">
        <p className="mb-1 font-medium text-muted-foreground text-xs">
          {isStaff ? "スタッフ" : "AI サポート"}
          <span className="ml-2 font-normal">{formatTime(message.createdAt)}</span>
        </p>
        <div
          className={cn(
            "break-words rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm leading-relaxed",
            "[&_a]:text-sky-600 [&_a]:underline dark:[&_a]:text-sky-300 [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_p]:my-0 [&_ul]:list-disc [&_ul]:pl-5",
            isStaff ? "border-emerald-500/30 bg-emerald-500/5" : "bg-muted/40",
          )}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: 本文は HTML をエスケープしてから Markdown にしている
          dangerouslySetInnerHTML={{ __html: renderBody(message.body) }}
        />
        {props.showFeedback && !isStaff && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
            {message.helpful === null ? (
              <>
                <span className="mr-1">この回答で解決しましたか？</span>
                <button
                  type="button"
                  className="rounded-full px-2 py-1 hover:bg-muted"
                  onClick={() => props.onFeedback(true)}
                >
                  <ThumbsUpIcon className="mr-1 inline size-3.5" />
                  解決した
                </button>
                <button
                  type="button"
                  className="rounded-full px-2 py-1 hover:bg-muted"
                  onClick={() => {
                    props.onFeedback(false)
                  }}
                >
                  <ThumbsDownIcon className="mr-1 inline size-3.5" />
                  解決しない
                </button>
              </>
            ) : message.helpful > 0 ? (
              <span>ありがとうございます！</span>
            ) : (
              <span>
                ごめんなさい。
                <button
                  type="button"
                  className="underline"
                  onClick={props.onEscalate}
                >
                  スタッフに相談する
                </button>
                か、詳しい状況を書いてください
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
