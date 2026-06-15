import { gql, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { Gift } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { AdminPageShell } from "~/components/admin-page-shell"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"

const viewerQuery = gql`
  query AdminAmazonExchangeViewer {
    viewer {
      id
      isModerator
    }
  }
`

type ExchangeRequest = {
  id: string
  userId: string
  packageId: string
  coinAmount: number
  amazonPointYen: number
  status: "PENDING" | "APPROVED"
  amazonGiftCode: string | null
  appliedAt: number
  approvedAt: number | null
}

type AdminListData = {
  requests: ExchangeRequest[]
  totalCount: number
}

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const formatDateTime = (unix: number) =>
  jstDateTimeFormatter.format(new Date(unix * 1000)).replace(/\//g, "/")

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "Amazonギフト券交換申請管理",
      enTitle: "Amazon Gift Card Exchange Admin",
      description:
        "ユーザからの交換申請一覧を確認し、コードを入力して承認します。",
      enDescription:
        "Review user exchange requests and approve them by entering Amazon gift codes.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

export default function AdminAmazonExchangePage() {
  const authContext = useContext(AuthContext)
  const [listData, setListData] = useState<AdminListData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED">(
    "PENDING",
  )

  // Approve dialog state
  const [selectedRequest, setSelectedRequest] =
    useState<ExchangeRequest | null>(null)
  const [giftCode, setGiftCode] = useState("")
  const [isApproving, setIsApproving] = useState(false)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) throw new Error("ログインが必要です")
    const idToken = await getIdToken(currentUser)
    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const loadList = async (status: "PENDING" | "APPROVED" = statusFilter) => {
    try {
      setIsLoading(true)
      const headers = await withAuthHeader()
      const res = await fetch(
        `/api/admin/amazon-exchange?status=${status}&limit=100`,
        {
          method: "GET",
          headers,
        },
      )
      const json_ = (await res.json()) as {
        error: string | null
        data?: AdminListData
      }
      if (!res.ok || json_.error || !json_.data) {
        throw new Error(json_.error ?? "読み込みに失敗しました")
      }
      setListData(json_.data)
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (status: "PENDING" | "APPROVED") => {
    setStatusFilter(status)
    loadList(status)
  }

  const openApproveDialog = (req: ExchangeRequest) => {
    setSelectedRequest(req)
    setGiftCode("")
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    if (!giftCode.trim()) {
      toast.error("Amazonギフト券コードを入力してください")
      return
    }

    try {
      setIsApproving(true)
      const headers = await withAuthHeader()
      const res = await fetch("/api/admin/amazon-exchange", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestId: selectedRequest.id,
          amazonGiftCode: giftCode.trim(),
        }),
      })
      const json_ = (await res.json()) as {
        error: string | null
        data?: { notificationSent?: boolean }
      }
      if (!res.ok || json_.error) {
        throw new Error(json_.error ?? "承認に失敗しました")
      }
      if (json_.data?.notificationSent === false) {
        toast.success(
          "承認しました。通知の作成は確認できなかったため、必要なら別途ユーザへ連絡してください。",
        )
      } else {
        toast.success("承認しました。ユーザへ通知しました。")
      }
      setSelectedRequest(null)
      setGiftCode("")
      await loadList()
    } catch (e) {
      if (e instanceof Error) toast.error(e.message)
    } finally {
      setIsApproving(false)
    }
  }

  if (viewerLoading || authContext.isLoading) {
    return (
      <AdminPageShell
        title="Amazonギフト券交換申請"
        description="交換申請にコードを入力して承認します。"
      >
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </AdminPageShell>
    )
  }

  if (!hasPermission) {
    return (
      <AdminPageShell
        title="Amazonギフト券交換申請"
        description="交換申請にコードを入力して承認します。"
      >
        <Alert>
          <AlertDescription>管理者権限が必要です。</AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  const requests = listData?.requests ?? []

  return (
    <AdminPageShell
      title="Amazonギフト券交換申請"
      description="交換申請にコードを入力して承認します。"
      icon={Gift}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-2xl">Amazonギフト券交換申請</h1>
            <p className="text-muted-foreground text-sm">
              申請一覧を確認し、コードを入力して承認します。
            </p>
          </div>
          <Button
            onClick={() => loadList()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "更新中..." : "更新"}
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("PENDING")}
          >
            審査中
          </Button>
          <Button
            variant={statusFilter === "APPROVED" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("APPROVED")}
          >
            承認済み
          </Button>
        </div>

        {/* Load on first open */}
        {listData === null && !isLoading && (
          <Button onClick={() => loadList()} variant="outline">
            申請一覧を読み込む
          </Button>
        )}

        {/* List */}
        {requests.length === 0 && listData !== null && (
          <p className="text-muted-foreground text-sm">
            {statusFilter === "PENDING"
              ? "審査中の申請はありません。"
              : "承認済みの申請はありません。"}
          </p>
        )}

        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>
                    ¥{req.amazonPointYen.toLocaleString()}分（
                    {req.coinAmount.toLocaleString()}コイン）
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium text-xs ${
                      req.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-600"
                    }`}
                  >
                    {req.status === "PENDING" ? "審査中" : "承認済み"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  <span>ユーザID</span>
                  <span className="font-mono">{req.userId}</span>
                  <span>申請ID</span>
                  <span className="font-mono text-xs">{req.id}</span>
                  <span>申請日時</span>
                  <span>{formatDateTime(req.appliedAt)}</span>
                  {req.approvedAt && (
                    <>
                      <span>承認日時</span>
                      <span>{formatDateTime(req.approvedAt)}</span>
                    </>
                  )}
                </div>

                {req.amazonGiftCode && (
                  <div className="mt-2 rounded-md bg-muted px-3 py-2">
                    <p className="select-all font-bold font-mono text-sm tracking-widest">
                      {req.amazonGiftCode}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      入力済みギフトコード
                    </p>
                  </div>
                )}

                {req.status === "PENDING" && (
                  <Button
                    size="sm"
                    className="mt-1"
                    onClick={() => openApproveDialog(req)}
                  >
                    コードを入力して承認
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Approve dialog */}
      <Dialog
        open={selectedRequest !== null}
        onOpenChange={(o) => {
          if (!o) setSelectedRequest(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Amazonギフト券コードを入力</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">ユーザID: </span>
                  <span className="font-mono">{selectedRequest.userId}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">交換額: </span>
                  <span className="font-bold">
                    ¥{selectedRequest.amazonPointYen.toLocaleString()}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">コイン消費: </span>
                  <span>
                    {selectedRequest.coinAmount.toLocaleString()}コイン
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="gift-code">Amazonギフト券コード</Label>
                <Input
                  id="gift-code"
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  placeholder="XXXX-XXXXXX-XXXX"
                  className="font-mono"
                />
              </div>

              <p className="text-muted-foreground text-xs">
                コードを入力して承認すると、ユーザ通知も作成します。この操作は取り消せません。
              </p>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedRequest(null)}
                  disabled={isApproving}
                >
                  キャンセル
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleApprove}
                  disabled={isApproving || !giftCode.trim()}
                >
                  {isApproving ? "承認中..." : "承認する"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
