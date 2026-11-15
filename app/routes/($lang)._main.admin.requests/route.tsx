import { gql, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { HandCoinsIcon } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import {
  RequestImageGrid,
  RequestStatusBadge,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import {
  type CoinRequest,
  formatCoins,
  formatDateTime,
  requestErrorMessage,
  requestsGet,
  requestsPost,
} from "~/lib/requests-api"
import { createMeta } from "~/utils/create-meta"

const viewerQuery = gql`
  query AdminRequestsViewer {
    viewer {
      id
      isModerator
    }
  }
`

type AdminReport = {
  id: string
  request_id: number | null
  plan_id: number | null
  reporter_user_id: string
  reason: string
  status: string
  created_at: number
}

type AdminList = {
  requests: CoinRequest[]
  reports: AdminReport[]
  totals: {
    count: number
    escrowCoins: number
    feeCoins: number
    earnedYen: number
  }
  users: RequestUsers
}

const FILTERS = [
  { value: "reported", label: "通報あり" },
  { value: "open", label: "進行中" },
  { value: "done", label: "完了" },
  { value: "closed", label: "終了" },
  { value: "", label: "すべて" },
]

export const meta: MetaFunction = (props) =>
  createMeta(META.ADMIN_REQUESTS, undefined, props.params.lang)

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export default function AdminRequestsPage() {
  const authContext = useContext(AuthContext)
  const { data: viewerData, loading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })
  const hasPermission = Boolean(viewerData?.viewer?.isModerator)
  const [filter, setFilter] = useState("reported")
  const [list, setList] = useState<AdminList | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setList(
        await requestsGet<AdminList>({
          op: "admin-list",
          status: filter === "reported" ? "" : filter,
          reported: filter === "reported" ? "1" : "",
        }),
      )
    } catch (e) {
      toast.error(requestErrorMessage(e))
    }
  }, [filter])

  useEffect(() => {
    if (hasPermission) void load()
  }, [hasPermission, load])

  const shell = (children: React.ReactNode) => (
    <AdminPageShell
      title="有料リクエスト"
      description="通報・進行中の依頼の確認。強制キャンセルは預かったコインを全額返却、強制完了はクリエイターへ受け取り分を渡します。"
      icon={HandCoinsIcon}
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
      {list && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ["依頼の数", `${list.totals.count} 件`],
            ["預かり中", `${formatCoins(list.totals.escrowCoins)} コイン`],
            ["手数料（累計）", `${formatCoins(list.totals.feeCoins)} コイン`],
            ["報酬（累計）", `${list.totals.earnedYen.toLocaleString()} 円`],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent className="p-3">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "secondary"}
            className="rounded-full"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {list && list.reports.length > 0 && filter === "reported" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">通報（新しい順）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {list.reports.slice(0, 30).map((r) => (
              <div key={r.id} className="flex flex-wrap gap-x-3 border-b pb-2">
                <span className="text-muted-foreground">
                  {formatDateTime(r.created_at)}
                </span>
                <span>
                  {r.request_id
                    ? `依頼 #${r.request_id}`
                    : `プラン #${r.plan_id}`}
                </span>
                <span className="text-muted-foreground">
                  通報者 {r.reporter_user_id}
                </span>
                <span className="w-full whitespace-pre-wrap">{r.reason}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!list ? (
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      ) : list.requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          該当する依頼はありません
        </p>
      ) : (
        <div className="space-y-2">
          {list.requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-3">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-2 text-left"
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                >
                  <span className="text-muted-foreground text-xs">#{r.id}</span>
                  <RequestStatusBadge status={r.status} />
                  <span className="font-bold text-sm">{r.title}</span>
                  <span className="text-sm">
                    {formatCoins(r.priceCoins)} コイン
                  </span>
                  {r.isR18 && (
                    <span className="text-rose-500 text-xs">R18</span>
                  )}
                  {(r.reportCount ?? 0) > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 text-white text-xs">
                      通報 {r.reportCount}
                    </span>
                  )}
                  <span className="ml-auto text-muted-foreground text-xs">
                    {formatDateTime(r.updatedAt)}
                  </span>
                </button>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  依頼者{" "}
                  <RequestUserChip user={list.users[r.requesterUserId]} />→
                  クリエイター{" "}
                  <RequestUserChip user={list.users[r.creatorUserId]} />
                </div>
                {openId === r.id && (
                  <AdminRequestDetail id={r.id} onChanged={load} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>,
  )
}

function AdminRequestDetail(props: { id: string; onChanged: () => void }) {
  const [request, setRequest] = useState<CoinRequest | null>(null)
  const [users, setUsers] = useState<RequestUsers>({})
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const data = await requestsGet<{
      request: CoinRequest
      users: RequestUsers
    }>({
      op: "admin-detail",
      id: props.id,
    })
    setRequest(data.request)
    setUsers(data.users)
  }, [props.id])

  useEffect(() => {
    void load().catch((e) => toast.error(requestErrorMessage(e)))
  }, [load])

  const act = async (action: "cancel" | "complete") => {
    const label =
      action === "cancel" ? "強制キャンセル（全額返却）" : "強制完了"
    if (!window.confirm(`#${props.id} を${label}しますか？`)) return
    setBusy(true)
    try {
      await requestsPost({ op: "admin-action", id: props.id, action, reason })
      toast.success(`${label}しました`)
      await load()
      props.onChanged()
    } catch (e) {
      toast.error(requestErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (!request)
    return <p className="text-muted-foreground text-xs">読み込み中...</p>
  const open = ["PENDING", "ACCEPTED", "DELIVERED"].includes(request.status)
  return (
    <div className="space-y-3 border-t pt-3 text-sm">
      <p className="whitespace-pre-wrap">{request.body}</p>
      <RequestImageGrid urls={request.referenceImageUrls} />
      {request.escrow && (
        <p className="text-muted-foreground text-xs">
          預かり: 無料 {request.escrow.freeCoins} / プレミアム{" "}
          {request.escrow.premiumCoins}（うち有料 {request.escrow.paidCoins}）
        </p>
      )}
      {request.settlement && (
        <p className="text-muted-foreground text-xs">
          精算: 手数料 {request.settlement.feeCoins}・報酬{" "}
          {request.settlement.earnedYen} 円・コイン 無料{" "}
          {request.settlement.freeCoins} / プレミアム{" "}
          {request.settlement.premiumCoins}
        </p>
      )}
      {request.closedReason && (
        <p className="text-muted-foreground text-xs">
          終了の理由: {request.closedReason}
        </p>
      )}
      {request.deliveryImageUrls.length > 0 && (
        <div>
          <p className="font-bold text-xs">納品</p>
          <RequestImageGrid urls={request.deliveryImageUrls} />
        </div>
      )}
      {(request.messages ?? []).length > 0 && (
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md bg-muted p-2 text-xs">
          {(request.messages ?? []).map((m) => (
            <p key={m.id} className="whitespace-pre-wrap">
              <span className="text-muted-foreground">
                {formatDateTime(m.createdAt)}{" "}
                {m.senderUserId
                  ? (users[m.senderUserId]?.name ?? m.senderUserId)
                  : "お知らせ"}
                :
              </span>{" "}
              {m.body}
            </p>
          ))}
        </div>
      )}
      {open && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="理由（両者に表示されます）"
            className="max-w-sm"
          />
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => act("cancel")}
          >
            強制キャンセル（全額返却）
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => act("complete")}
          >
            強制完了
          </Button>
        </div>
      )}
    </div>
  )
}
