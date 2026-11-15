import { gql, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { BanknoteIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { AuthContext } from "~/contexts/auth-context"
import { formatYen } from "~/lib/creator-rewards"
import { createMeta } from "~/utils/create-meta"

const viewerQuery = gql`
  query AdminCreatorPayoutsViewer {
    viewer {
      id
      isModerator
    }
  }
`

type AdminPayout = {
  id: string
  userId: string
  period: string
  status: string
  grossYen: number
  withholdingYen: number
  feeYen: number
  netYen: number
  earningsCount: number
  flags: Array<{ code: string; senderUserId?: string; share?: number }>
  livemode: boolean
  stripeTransferId: string | null
  attempts: number
  lastError: string | null
  approvedAt: number | null
  sentAt: number | null
  createdAt: number
  taxKind: string | null
  isFirstPayout: boolean
}

type Overview = {
  config: { stripeMode: string; enabled: boolean }
  profiles: Array<{ status: string; count: number; payoutReady: number }>
  earnings: Array<{ status: string; count: number; coins: number; yen: number }>
  payouts: AdminPayout[]
  totals: Array<{
    status: string
    count: number
    netYen: number
    withholdingYen: number
  }>
}

const STATUS_LABELS: Record<string, string> = {
  AWAITING_APPROVAL: "承認待ち",
  READY: "送金待ち",
  SENDING: "送金中",
  SENT: "送金済み",
  FAILED: "失敗",
  CANCELED: "取りやめ",
  HOLDING: "保留中",
  HELD: "保留明け",
  IN_PAYOUT: "締め済み",
  PAID: "振込済み",
  REVERSED: "取り消し",
  JOINED: "参加中",
  LEFT: "退会",
  SUSPENDED: "停止",
}

const FLAG_LABELS: Record<string, string> = {
  single_sender: "1 人からの推しが大半",
  shared_ip: "推した人と同じ IP",
  new_sender_account: "推した人が登録 7 日未満",
  check_failed: "確認に失敗",
}

const formatDateTime = (unix: number | null) =>
  unix
    ? new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(unix * 1000))
    : "-"

export const meta: MetaFunction = (props) =>
  createMeta(
    {
      title: "クリエイター報酬の振込",
      enTitle: "Creator payouts",
      description: "クリエイター報酬の承認キューと振込の状況",
      enDescription: "Creator payout approval queue",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

export default function AdminCreatorPayoutsPage() {
  const authContext = useContext(AuthContext)
  const { data: viewerData, loading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const hasPermission = Boolean(viewerData?.viewer?.isModerator)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [status, setStatus] = useState("AWAITING_APPROVAL")
  const [busy, setBusy] = useState<string | null>(null)
  const [period, setPeriod] = useState("")
  const [closePreview, setClosePreview] = useState<unknown>(null)

  const headers = async () => {
    const user = getAuth().currentUser
    if (!user) throw new Error("ログインが必要です")
    return {
      authorization: `Bearer ${await getIdToken(user)}`,
      "content-type": "application/json",
    }
  }

  const load = async (s = status) => {
    try {
      const res = await fetch(`/api/admin/creator-payouts?status=${s}`, {
        headers: await headers(),
      })
      const body = (await res.json()) as {
        error: string | null
        data: Overview
      }
      if (!res.ok || body.error)
        throw new Error(body.error ?? "読み込みに失敗しました")
      setOverview(body.data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "読み込みに失敗しました")
    }
  }

  const post = async (payload: Record<string, unknown>, label: string) => {
    setBusy(label)
    try {
      const res = await fetch("/api/admin/creator-payouts", {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify(payload),
      })
      const body = (await res.json()) as { error: string | null; data: unknown }
      if (!res.ok || body.error) throw new Error(body.error ?? "失敗しました")
      return body.data
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "失敗しました")
      return null
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    if (hasPermission) void load(status)
  }, [hasPermission, status])

  const shell = (children: React.ReactNode) => (
    <AdminPageShell
      title="クリエイター報酬の振込"
      description="推しで受け取った有料コインの報酬（Stripe Connect）。承認すると送金します。"
      icon={BanknoteIcon}
    >
      {children}
    </AdminPageShell>
  )

  if (loading || authContext.isLoading)
    return shell(<p className="text-muted-foreground text-sm">読み込み中...</p>)
  if (!hasPermission)
    return shell(
      <Alert>
        <AlertDescription>管理者権限が必要です。</AlertDescription>
      </Alert>,
    )

  return shell(
    <div className="space-y-4">
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              概要（Stripe:{" "}
              {overview.config.stripeMode === "live" ? "本番" : "テストモード"}
              {overview.config.enabled ? "" : "・停止中"}）
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-3">
            <div>
              <p className="font-bold">参加者</p>
              {overview.profiles.map((p) => (
                <p key={p.status}>
                  {STATUS_LABELS[p.status] ?? p.status}: {p.count}{" "}
                  人（口座登録済み {p.payoutReady}）
                </p>
              ))}
            </div>
            <div>
              <p className="font-bold">報酬</p>
              {overview.earnings.map((e) => (
                <p key={e.status}>
                  {STATUS_LABELS[e.status] ?? e.status}: {formatYen(e.yen)}（
                  {e.count} 件・{e.coins.toLocaleString()} 枚）
                </p>
              ))}
            </div>
            <div>
              <p className="font-bold">
                振込（源泉徴収は翌月 10 日までに納付）
              </p>
              {overview.totals.map((t) => (
                <p key={t.status}>
                  {STATUS_LABELS[t.status] ?? t.status}: {t.count} 件{" "}
                  {formatYen(t.netYen)}（源泉 {formatYen(t.withholdingYen)}）
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {["AWAITING_APPROVAL", "READY", "FAILED", "SENT", "CANCELED"].map(
          (s) => (
            <Button
              key={s}
              size="sm"
              variant={s === status ? "default" : "secondary"}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ),
        )}
      </div>

      {overview?.payouts.length === 0 && (
        <p className="text-muted-foreground text-sm">ありません</p>
      )}
      {overview?.payouts.map((p) => (
        <Card key={p.id}>
          <CardContent className="space-y-2 pt-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a
                className="font-bold underline"
                href={`/users/${p.userId}`}
                target="_blank"
                rel="noreferrer"
              >
                user {p.userId}
              </a>
              <span>
                {p.period} ・ {STATUS_LABELS[p.status] ?? p.status}
                {p.isFirstPayout ? " ・ 初回" : ""} ・{" "}
                {p.livemode ? "本番" : "テスト"}
              </span>
            </div>
            <p>
              報酬 {formatYen(p.grossYen)} − 源泉 {formatYen(p.withholdingYen)}
              （{p.taxKind === "CORPORATION" ? "法人" : "個人"}）− 手数料{" "}
              {formatYen(p.feeYen)} = <strong>{formatYen(p.netYen)}</strong>（
              {p.earningsCount} 件）
            </p>
            {p.flags.length > 0 && (
              <p className="text-red-600">
                確認:{" "}
                {p.flags
                  .map(
                    (f) =>
                      `${FLAG_LABELS[f.code] ?? f.code}${f.senderUserId ? `（user ${f.senderUserId}${f.share ? ` ${f.share}%` : ""}）` : ""}`,
                  )
                  .join("、")}
              </p>
            )}
            {p.lastError && (
              <p className="break-all text-muted-foreground text-xs">
                {p.lastError}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              作成 {formatDateTime(p.createdAt)} ・ 承認{" "}
              {formatDateTime(p.approvedAt)} ・ 送金 {formatDateTime(p.sentAt)}
              {p.stripeTransferId ? ` ・ ${p.stripeTransferId}` : ""}
            </p>
            {["AWAITING_APPROVAL", "READY", "FAILED"].includes(p.status) && (
              <div className="flex flex-wrap gap-2">
                {p.status === "AWAITING_APPROVAL" && (
                  <Button
                    size="sm"
                    disabled={busy !== null}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          `user ${p.userId} に ${formatYen(p.netYen)} を送金します。よろしいですか？`,
                        )
                      )
                        return
                      const r = await post(
                        { intent: "approve", payoutId: p.id },
                        p.id,
                      )
                      if (r) toast.success("承認しました")
                      await load()
                    }}
                  >
                    承認して送金
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy !== null}
                  onClick={async () => {
                    const r = await post(
                      { intent: "cancel", payoutId: p.id, mode: "release" },
                      p.id,
                    )
                    if (r) toast.success("翌月以降に繰り越しました")
                    await load()
                  }}
                >
                  保留に戻す（繰り越し）
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy !== null}
                  onClick={async () => {
                    const reason = window.prompt(
                      "取り消しの理由（自分への推し・不正など）",
                    )
                    if (!reason) return
                    const r = await post(
                      {
                        intent: "cancel",
                        payoutId: p.id,
                        mode: "reverse",
                        reason,
                      },
                      p.id,
                    )
                    if (r) toast.success("報酬を取り消しました")
                    await load()
                  }}
                >
                  報酬を取り消す
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">締め・送金を手で動かす</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            ふだんは毎月 10 日・25 日 10:00 に自動で締め（その日の 0:00
            までに保留が明けた分）、承認済みは毎日 10:00
            に送金します。試算は書き込みません。
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-32"
              placeholder="2026-11-25"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={async () =>
                setClosePreview(
                  await post(
                    { intent: "close", period, dryRun: true },
                    "close",
                  ),
                )
              }
            >
              締めの試算
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={async () => {
                if (
                  !window.confirm(
                    "締めを実行します（何度実行しても同じ結果）。よろしいですか？",
                  )
                )
                  return
                setClosePreview(
                  await post(
                    { intent: "close", period, dryRun: false },
                    "close",
                  ),
                )
                await load()
              }}
            >
              締めを実行
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={async () => {
                setClosePreview(await post({ intent: "send" }, "send"))
                await load()
              }}
            >
              送金待ちを今すぐ送る
            </Button>
          </div>
          {closePreview !== null && (
            <pre className="max-h-80 overflow-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(closePreview, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>,
  )
}
