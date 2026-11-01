import { useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BotIcon,
  CheckCircle2Icon,
  HeadsetIcon,
  Loader2Icon,
  MailIcon,
  MessagesSquareIcon,
  PlusIcon,
  SendIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { marked } from "marked"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

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

/** AI で解決できないときの相談先（有人の窓口はないため） */
const DISCORD_INVITE_URL = "https://discord.gg/hcQggQEYfn"

const STATUS_LABEL: Record<SupportTicket["status"], string> = {
  ai: "AI が回答します",
  waiting_staff: "AI が回答します",
  staff_replied: "AI が回答します",
  resolved: "解決済み",
}

const callSupportApi = async <T,>(
  op: string,
  body: Record<string, unknown>,
): Promise<T> => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
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
 * お問い合わせ（AI が答える。有人の窓口はないので、AI で解決できないものは Discord を案内する）
 * 運営からのメッセージ（規約違反の連絡など）もここに出し、そのまま AI に質問できる
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
  // 以前の「スタッフ対応中」のお問い合わせも、今は AI が答える
  const isStaffHandling = false

  const [searchParams] = useSearchParams()
  const focusedLetterId = searchParams.get("letter")

  // 運営からのメッセージ（本人宛て。登録時の自動メッセージは除く）
  const { data: lettersData } = useQuery(supportLettersQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 10 },
  })
  const letters = (lettersData?.viewer?.supportMessages ?? []).filter(
    (message) =>
      !message.isViewer && !message.text.startsWith("この度はご登録いただき"),
  )

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
        ticketId: options?.newTicket
          ? undefined
          : isOpenTicket
            ? ticket?.id
            : undefined,
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
      toast.error(error instanceof Error ? error.message : "送信に失敗しました")
    } finally {
      setPendingText(null)
      setIsSending(false)
      textareaRef.current?.focus()
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
    setThread((prev) => ({
      ticket: null,
      messages: [],
      tickets: prev?.tickets,
    }))
    setText("")
    textareaRef.current?.focus()
  }

  const showWelcome = !isLoading && (!isOpenTicket || messages.length === 0)
  const lastAiMessageId = [...messages]
    .reverse()
    .find((m) => m.role === "ai")?.id

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
              : "AI がすぐにお答えします"}
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
        {letters.length > 0 && (
          <SupportLetters
            letters={letters}
            focusedLetterId={focusedLetterId}
            disabled={isSending}
            onAsk={(letter) =>
              void send(
                `運営からのメッセージ（${formatTime(letter.createdAt)}）について教えてください。\n「${letter.text.slice(0, 300)}」`,
                { newTicket: !isOpenTicket },
              )
            }
          />
        )}
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
                あなたのプランやコイン、最近の生成の記録、運営からのメッセージを確認しながら
                AI がお答えします。返金や不具合の調査など AI
                で解決できないものは、
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 underline"
                >
                  Discord サーバー
                </a>
                でご相談ください。
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
            <Button variant="secondary" size="sm" asChild>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessagesSquareIcon className="mr-1 size-4" />
                Discord で相談する
              </a>
            </Button>
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
              "困っていることを書いてください（例: コインが減った、運営からのメッセージの意味）"
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
          Enter で送信・Shift+Enter
          で改行。パスワードやカード番号は書かないでください
        </p>
      </div>
    </div>
  )
}

function MessageBubble(props: {
  message: SupportMessage
  showFeedback: boolean
  onFeedback: (helpful: boolean) => void
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
          {isStaff ? "運営" : "AI サポート"}
          <span className="ml-2 font-normal">
            {formatTime(message.createdAt)}
          </span>
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
                ごめんなさい。詳しい状況（作品の
                URL・日時・画面のメッセージ）を書くか、
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Discord で相談
                </a>
                してください
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

type SupportLetter = {
  id: string
  text: string
  createdAt: number
}

/**
 * 運営からのメッセージ（規約違反の連絡など）。押すとその内容について AI に質問できる
 */
function SupportLetters(props: {
  letters: SupportLetter[]
  focusedLetterId: string | null
  disabled: boolean
  onAsk: (letter: SupportLetter) => void
}) {
  const [isOpen, setIsOpen] = useState(props.focusedLetterId !== null)
  const visible = isOpen ? props.letters : props.letters.slice(0, 1)
  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <MailIcon className="size-4 text-amber-600 dark:text-amber-300" />
        <h2 className="font-bold text-sm">運営からのメッセージ</h2>
        {props.letters.length > 1 && (
          <button
            type="button"
            className="ml-auto text-muted-foreground text-xs underline"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? "閉じる" : `すべて見る（${props.letters.length}件）`}
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {visible.map((letter) => (
          <li
            key={letter.id}
            className={cn(
              "rounded-lg bg-background p-2.5 text-sm",
              letter.id === props.focusedLetterId && "ring-2 ring-amber-400",
            )}
          >
            <p className="mb-1 text-muted-foreground text-xs">
              {formatTime(letter.createdAt)}
            </p>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {letter.text}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-8 rounded-full"
              disabled={props.disabled}
              onClick={() => props.onAsk(letter)}
            >
              <BotIcon className="mr-1 size-4" />
              このメッセージについて AI に聞く
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

const supportLettersQuery = graphql(
  `query SupportLetters($offset: Int!, $limit: Int!) {
    viewer {
      id
      supportMessages(offset: $offset, limit: $limit) {
        id
        text
        createdAt
        isViewer
      }
    }
  }`,
)
