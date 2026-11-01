import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { Headset, Loader2Icon, RefreshCwIcon } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "お問い合わせ",
      enTitle: "Support",
      description: "AI から引き継いだお問い合わせ",
      enDescription: "Support tickets",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

type Status = "ai" | "waiting_staff" | "staff_replied" | "resolved"

type TicketItem = {
  id: string
  userId: string
  userName: string | null
  passType: string | null
  status: Status
  category: string | null
  summary: string | null
  staffUnread: boolean
  lastUserMessage: string | null
  messageCount: number
  updatedAt: number
}

type TicketDetail = {
  ticket: TicketItem & { contactEmail: string | null }
  messages: {
    id: string
    role: "user" | "ai" | "staff" | "system"
    body: string
    helpful: number | null
    createdAt: number
  }[]
  accountContext: string
}

type ListData = {
  tickets: TicketItem[]
  counts: Partial<Record<Status, number>>
  stats: {
    aiReplies: number
    helpful: number
    notHelpful: number
    inputTokens: number
    outputTokens: number
  }
}

const STATUS_TABS: { key: Status | "all"; label: string }[] = [
  { key: "waiting_staff", label: "対応待ち" },
  { key: "staff_replied", label: "返信済み" },
  { key: "ai", label: "AI 対応中" },
  { key: "resolved", label: "解決済み" },
  { key: "all", label: "すべて" },
]

const ROLE_LABEL = {
  user: "ユーザー",
  ai: "AI",
  staff: "スタッフ",
  system: "お知らせ",
} as const

const callAdmin = async <T,>(op: string, body: Record<string, unknown>) => {
  const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  const response = await fetch(`/api/admin/support/${op}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = (await response.json().catch(() => null)) as {
    error?: string | null
    data?: T
  } | null
  if (!response.ok || !json || json.error || json.data === undefined) {
    throw new Error(json?.error ?? `HTTP ${response.status}`)
  }
  return json.data
}

const formatTime = (epoch: number) =>
  new Date(epoch * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

/**
 * スタッフ用のお問い合わせ受付
 */
export default function AdminSupport() {
  const authContext = useContext(AuthContext)
  const [status, setStatus] = useState<Status | "all">("waiting_staff")
  const [list, setList] = useState<ListData | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TicketDetail | null>(null)
  const [reply, setReply] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadList = useCallback(async () => {
    setIsLoading(true)
    try {
      setList(await callAdmin<ListData>("tickets", { status }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [status])

  const loadDetail = useCallback(async (ticketId: string) => {
    try {
      setDetail(await callAdmin<TicketDetail>("ticket", { ticketId }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "読み込みに失敗しました")
    }
  }, [])

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    void loadList()
  }, [authContext.isLoading, authContext.isNotLoggedIn, loadList])

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId)
  }, [selectedId, loadDetail])

  const submit = async (nextStatus?: Status, text: string = reply) => {
    if (!detail) return
    setIsSending(true)
    try {
      const data = await callAdmin<{ emailed: boolean }>("reply", {
        ticketId: detail.ticket.id,
        body: text,
        status: nextStatus,
      })
      if (text.trim().length > 0) {
        toast.success(
          data.emailed ? "返信しました（メールでもお知らせしました）" : "返信しました",
        )
      } else {
        toast.success("状態を変更しました")
      }
      setReply("")
      await Promise.all([loadDetail(detail.ticket.id), loadList()])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "送信に失敗しました")
    } finally {
      setIsSending(false)
    }
  }

  const stats = list?.stats
  const helpfulRate =
    stats && stats.helpful + stats.notHelpful > 0
      ? Math.round((stats.helpful / (stats.helpful + stats.notHelpful)) * 100)
      : null

  return (
    <AdminPageShell
      title="お問い合わせ"
      description="AI が答えられずに引き継いだ相談に返事します。返事はユーザーのお問い合わせ画面に届き、メールアドレスがある人にはメールでも知らせます"
      icon={Headset}
    >
      <div className="space-y-4 text-slate-100">
        {stats && (
          <p className="text-slate-400 text-xs">
            直近 30 日: AI の回答 {stats.aiReplies} 件
            {helpfulRate !== null && `・解決したと答えた人 ${helpfulRate}%（${stats.helpful}/${stats.helpful + stats.notHelpful}）`}
            ・トークン 入力 {stats.inputTokens.toLocaleString()} / 出力{" "}
            {stats.outputTokens.toLocaleString()}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={status === tab.key ? "default" : "outline"}
              onClick={() => {
                setStatus(tab.key)
                setSelectedId(null)
                setDetail(null)
              }}
            >
              {tab.label}
              {tab.key !== "all" && (list?.counts[tab.key] ?? 0) > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {list?.counts[tab.key]}
                </Badge>
              )}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => void loadList()}>
            {isLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-2">
            {list?.tickets.length === 0 && (
              <p className="rounded-2xl border border-white/10 p-6 text-center text-slate-400 text-sm">
                ありません
              </p>
            )}
            {list?.tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition",
                  selectedId === ticket.id
                    ? "border-sky-400/60 bg-sky-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <div className="flex items-center gap-2 text-xs">
                  {ticket.staffUnread && (
                    <span className="size-2 rounded-full bg-rose-400" />
                  )}
                  <span className="font-medium">
                    {ticket.userName ?? "（名前なし）"}
                  </span>
                  <span className="text-slate-400">
                    #{ticket.userId}・{ticket.passType ?? "FREE"}
                  </span>
                  <span className="ml-auto text-slate-400">
                    {formatTime(ticket.updatedAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 font-medium text-sm">
                  {ticket.summary ?? "（要約なし）"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-slate-400 text-xs">
                  {ticket.lastUserMessage}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            {!detail && (
              <p className="py-10 text-center text-slate-400 text-sm">
                左から選んでください
              </p>
            )}
            {detail && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/users/${detail.ticket.userId}`}
                    target="_blank"
                    className="font-bold underline"
                  >
                    {detail.ticket.userName ?? `#${detail.ticket.userId}`}
                  </Link>
                  <Badge variant="outline">{detail.ticket.status}</Badge>
                  {detail.ticket.category && (
                    <Badge variant="outline">{detail.ticket.category}</Badge>
                  )}
                  <span className="text-slate-400 text-xs">
                    {detail.ticket.contactEmail ? "メール通知あり" : "メール通知なし"}
                  </span>
                  <Link
                    to={`/admin/coin-histories?userId=${detail.ticket.userId}`}
                    target="_blank"
                    className="ml-auto text-sky-300 text-xs underline"
                  >
                    コイン履歴
                  </Link>
                </div>

                <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                  {detail.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm",
                        message.role === "user" && "bg-sky-500/15",
                        message.role === "ai" && "bg-white/5",
                        message.role === "staff" && "bg-emerald-500/15",
                        message.role === "system" && "bg-amber-500/10 text-xs",
                      )}
                    >
                      <p className="mb-1 text-slate-400 text-xs">
                        {ROLE_LABEL[message.role]}・{formatTime(message.createdAt)}
                        {message.helpful === 1 && "・👍"}
                        {message.helpful === -1 && "・👎"}
                      </p>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                    </div>
                  ))}
                </div>

                <details className="rounded-xl border border-white/10 p-3 text-xs">
                  <summary className="cursor-pointer text-slate-300">
                    アカウントの状況（AI が見ているもの）
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-slate-400">
                    {detail.accountContext}
                  </pre>
                </details>

                <div className="space-y-2">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={5}
                    placeholder="ユーザーへの返事（そのままユーザーの画面に出ます）"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-400"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={isSending || reply.trim().length === 0}
                      onClick={() => void submit()}
                    >
                      返信する
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isSending || reply.trim().length === 0}
                      onClick={() => void submit("resolved")}
                    >
                      返信して解決済みにする
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={isSending}
                      onClick={() => void submit("resolved", "")}
                    >
                      返信せず解決済みにする
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
