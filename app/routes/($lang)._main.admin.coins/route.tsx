import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { getAuth, getIdToken } from "firebase/auth"
import { Coins, Loader2Icon, Shield } from "lucide-react"
import { Link } from "@remix-run/react"
import { useContext, useEffect, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import { AdminPageShell } from "~/components/admin-page-shell"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { toast } from "sonner"

const pageDescription = "全ユーザ、プラン別ユーザ、または指定ユーザIDに対してコインを一括で付与・減少します。"

const viewerQuery = gql`
  query AdminCoinsViewer {
    viewer {
      id
      isModerator
    }
  }
`

const adminAdjustCoinsMutation = gql`
  mutation AdminAdjustCoins(
    $targetScope: String!
    $planType: String
    $userIds: [ID!]
    $freeDelta: Int
    $premiumDelta: Int
    $expiresAt: Int
  ) {
    adminAdjustCoins(
      targetScope: $targetScope
      planType: $planType
      userIds: $userIds
      freeDelta: $freeDelta
      premiumDelta: $premiumDelta
      expiresAt: $expiresAt
    ) {
      targetCount
      changedCount
      freeGrantedTotal
      premiumGrantedTotal
      freeReducedTotal
      premiumReducedTotal
    }
  }
`

const adminCoinOperationHistoriesQuery = gql`
  query AdminCoinOperationHistories($offset: Int!, $limit: Int!) {
    adminCoinOperationHistories(offset: $offset, limit: $limit) {
      id
      createdAt
      moderatorUserId
      targetScope
      planType
      targetUserIds
      targetCount
      changedCount
      freeDelta
      premiumDelta
      freeGrantedTotal
      premiumGrantedTotal
      freeReducedTotal
      premiumReducedTotal
      expiresAt
    }
    adminCoinOperationHistoriesCount
  }
`

type OperationType = "GRANT" | "REDUCE"
type TargetScope = "ALL" | "PLAN" | "USER_IDS"
type PlanType = "FREE" | "TWO_DAYS" | "LITE" | "STANDARD" | "PREMIUM"
type ExchangeStatusFilter = "PENDING" | "APPROVED" | "REFLECTED"

type AdminCoinOperationHistory = {
  id: string
  createdAt: number
  moderatorUserId: string
  targetScope: TargetScope
  planType: string | null
  targetUserIds: string[]
  targetCount: number
  changedCount: number
  freeDelta: number
  premiumDelta: number
  freeGrantedTotal: number
  premiumGrantedTotal: number
  freeReducedTotal: number
  premiumReducedTotal: number
  expiresAt: number | null
}

type AmazonExchangeAdminRequest = {
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

type AmazonExchangeAdminListData = {
  requests: AmazonExchangeAdminRequest[]
  totalCount: number
}

const planOptions: Array<{ value: PlanType; label: string }> = [
  { value: "FREE", label: "無料ユーザ" },
  { value: "TWO_DAYS", label: "2日プラン" },
  { value: "LITE", label: "ライトプラン" },
  { value: "STANDARD", label: "スタンダードプラン" },
  { value: "PREMIUM", label: "プレミアムプラン" },
]

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "コイン操作",
      enTitle: "Admin Coin Operation",
      description: pageDescription,
      enDescription: "Bulk grant or reduce coins for all users, plan segments, or specific user IDs.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
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

const parseUserIdsText = (value: string) => {
  return Array.from(
    new Set(
      value
        .split(/[\s,、]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

const formatTargetScope = (scope: TargetScope, planType: string | null) => {
  if (scope === "ALL") {
    return "全ユーザ"
  }

  if (scope === "USER_IDS") {
    return "ユーザID指定"
  }

  switch (planType) {
    case "FREE":
      return "無料ユーザ"
    case "TWO_DAYS":
      return "2日プラン"
    case "LITE":
      return "ライトプラン"
    case "STANDARD":
      return "スタンダードプラン"
    case "PREMIUM":
      return "プレミアムプラン"
    default:
      return "プラン別"
  }
}

const formatDelta = (freeDelta: number, premiumDelta: number) => {
  const parts: string[] = []

  if (freeDelta !== 0) {
    parts.push(`フリー ${freeDelta > 0 ? "+" : ""}${freeDelta}`)
  }

  if (premiumDelta !== 0) {
    parts.push(`プレミアム ${premiumDelta > 0 ? "+" : ""}${premiumDelta}`)
  }

  return parts.length > 0 ? parts.join(" / ") : "0"
}

export default function AdminCoinsPage() {
  const authContext = useContext(AuthContext)
  const [operationType, setOperationType] = useState<OperationType>("GRANT")
  const [targetScope, setTargetScope] = useState<TargetScope>("ALL")
  const [planType, setPlanType] = useState<PlanType>("FREE")
  const [userIdsText, setUserIdsText] = useState("")
  const [freeCoins, setFreeCoins] = useState("0")
  const [premiumCoins, setPremiumCoins] = useState("0")
  const [expiresAtInput, setExpiresAtInput] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [exchangeListData, setExchangeListData] =
    useState<AmazonExchangeAdminListData | null>(null)
  const [isLoadingExchangeList, setIsLoadingExchangeList] = useState(false)
  const [exchangeStatusFilter, setExchangeStatusFilter] =
    useState<ExchangeStatusFilter>("PENDING")
  const [giftCodeByRequestId, setGiftCodeByRequestId] = useState<
    Record<string, string>
  >({})
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  )

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useQuery(adminCoinOperationHistoriesQuery, {
    variables: {
      offset: 0,
      limit: 20,
    },
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "network-only",
  })

  const [mutate, { loading: isSubmitting }] = useMutation(adminAdjustCoinsMutation)

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const parsedFreeCoins = Math.max(0, Number.parseInt(freeCoins || "0", 10) || 0)
  const parsedPremiumCoins = Math.max(0, Number.parseInt(premiumCoins || "0", 10) || 0)
  const requiresExpiry = operationType === "GRANT" && (parsedFreeCoins > 0 || parsedPremiumCoins > 0)
  const parsedUserIds = parseUserIdsText(userIdsText)
  const histories = (historyData?.adminCoinOperationHistories ?? []) as AdminCoinOperationHistory[]
  const historyCount = historyData?.adminCoinOperationHistoriesCount ?? 0

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error("ログインが必要です。")
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const loadExchangeList = async () => {
    try {
      setIsLoadingExchangeList(true)
      const headers = await withAuthHeader()

      const [pendingResponse, approvedResponse] = await Promise.all([
        fetch(`/api/admin/amazon-exchange?status=PENDING&limit=100`, {
          method: "GET",
          headers,
        }),
        fetch(`/api/admin/amazon-exchange?status=APPROVED&limit=100`, {
          method: "GET",
          headers,
        }),
      ])

      const [pendingJson, approvedJson] = (await Promise.all([
        pendingResponse.json(),
        approvedResponse.json(),
      ])) as Array<{
        error: string | null
        data?: AmazonExchangeAdminListData
      }>

      if (
        !pendingResponse.ok ||
        !approvedResponse.ok ||
        pendingJson.error ||
        approvedJson.error
      ) {
        throw new Error(
          pendingJson.error ?? approvedJson.error ?? "交換申請一覧の取得に失敗しました。",
        )
      }

      const pendingRequests = pendingJson.data?.requests ?? []
      const approvedRequests = approvedJson.data?.requests ?? []
      const mergedRequests = [...pendingRequests, ...approvedRequests].sort(
        (a, b) => (b.appliedAt ?? 0) - (a.appliedAt ?? 0),
      )

      setExchangeListData({
        requests: mergedRequests,
        totalCount:
          (pendingJson.data?.totalCount ?? pendingRequests.length) +
          (approvedJson.data?.totalCount ?? approvedRequests.length),
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "交換申請一覧の取得に失敗しました。"
      toast.error(message)
    } finally {
      setIsLoadingExchangeList(false)
    }
  }

  const handleApproveExchangeRequest = async (requestId: string) => {
    const giftCode = (giftCodeByRequestId[requestId] ?? "").trim()
    if (!giftCode) {
      toast.error("Amazonギフトコードを入力してください。")
      return
    }

    try {
      setApprovingRequestId(requestId)
      const headers = await withAuthHeader()
      const response = await fetch("/api/admin/amazon-exchange", {
        method: "POST",
        headers,
        body: JSON.stringify({
          requestId,
          amazonGiftCode: giftCode,
        }),
      })

      const json = (await response.json()) as {
        error: string | null
        data?: { notificationSent?: boolean }
      }

      if (!response.ok || json.error) {
        throw new Error(json.error ?? "コード反映に失敗しました。")
      }

      setGiftCodeByRequestId((current) => ({
        ...current,
        [requestId]: "",
      }))

      toast.success(
        json.data?.notificationSent === false
          ? "コード反映を完了しました。通知作成は確認できませんでした。"
          : "コード反映と承認を完了しました。",
      )

      await loadExchangeList()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "コード反映に失敗しました。"
      toast.error(message)
    } finally {
      setApprovingRequestId(null)
    }
  }

  useEffect(() => {
    if (!hasPermission) {
      return
    }

    void loadExchangeList()
  }, [hasPermission])

  const exchangeRequests = exchangeListData?.requests ?? []
  const pendingExchangeRequests = exchangeRequests.filter(
    (request) => request.status === "PENDING",
  )
  const approvedExchangeRequests = exchangeRequests.filter(
    (request) => request.status === "APPROVED",
  )
  const reflectedExchangeRequests = approvedExchangeRequests.filter(
    (request) => (request.amazonGiftCode?.trim().length ?? 0) > 0,
  )

  const displayedExchangeRequests = exchangeRequests.filter((request) => {
    if (exchangeStatusFilter === "PENDING") {
      return request.status === "PENDING"
    }

    if (exchangeStatusFilter === "APPROVED") {
      return request.status === "APPROVED"
    }

    return (request.amazonGiftCode?.trim().length ?? 0) > 0
  })

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (parsedFreeCoins === 0 && parsedPremiumCoins === 0) {
      const message = "付与または減少するコイン数を入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (requiresExpiry && !expiresAtInput) {
      const message = "付与コインの失効日時を指定してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    if (targetScope === "USER_IDS" && parsedUserIds.length === 0) {
      const message = "対象ユーザIDを1件以上入力してください。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    const expiresAt = expiresAtInput
      ? Math.floor(new Date(expiresAtInput).getTime() / 1000)
      : undefined

    if (requiresExpiry && (!expiresAt || Number.isNaN(expiresAt))) {
      const message = "失効日時の形式が不正です。"
      setSubmitError(message)
      toast.error(message)
      return
    }

    try {
      setSubmitError(null)

      const freeDelta = operationType === "GRANT" ? parsedFreeCoins : -parsedFreeCoins
      const premiumDelta = operationType === "GRANT" ? parsedPremiumCoins : -parsedPremiumCoins

      const response = await mutate({
        variables: {
          targetScope,
          planType: targetScope === "PLAN" ? planType : null,
          userIds: targetScope === "USER_IDS" ? parsedUserIds : null,
          freeDelta,
          premiumDelta,
          expiresAt: requiresExpiry ? expiresAt : null,
        },
      })

      const result = response.data?.adminAdjustCoins ?? null

      if (!result) {
        throw new Error("コイン操作の実行に失敗しました。")
      }

      setLastResult(result)
      setOperationType("GRANT")
      setTargetScope("ALL")
      setPlanType("FREE")
      setUserIdsText("")
      setFreeCoins("0")
      setPremiumCoins("0")
      setExpiresAtInput("")
      setSubmitError(null)
      await refetchHistory()
      toast.success(`コイン操作が完了しました。対象 ${result.targetCount} 件中 ${result.changedCount} 件を更新しました。`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "コイン操作の実行に失敗しました。"
      setSubmitError(message)
      toast.error(message)
    }
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title="コイン操作" description={pageDescription} icon={Coins}>
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell title="コイン操作" description={pageDescription} icon={Coins}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページにアクセスするにはログインが必要です。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  if (!hasPermission) {
    return (
      <AdminPageShell title="コイン操作" description={pageDescription} icon={Coins}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページはモデレーターのみ利用できます。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title="コイン操作" description={pageDescription} icon={Shield}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Coins className="size-5 text-cyan-300" />
              一括コイン操作
            </CardTitle>
            <CardDescription className="text-slate-400">
              付与は指定日時に失効します。減少は保有 lot を古い順に消費します。
            </CardDescription>
            <Button
              asChild
              variant="outline"
              className="mt-3 w-fit border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            >
              <Link to="/admin/coin-histories">コイン履歴ページを開く</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>操作種別</Label>
                  <Select
                    value={operationType}
                    onValueChange={(value) => setOperationType(value as OperationType)}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRANT">付与</SelectItem>
                      <SelectItem value="REDUCE">減少</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>対象範囲</Label>
                  <Select
                    value={targetScope}
                    onValueChange={(value) => setTargetScope(value as TargetScope)}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">全ユーザ</SelectItem>
                      <SelectItem value="PLAN">プラン別</SelectItem>
                      <SelectItem value="USER_IDS">ユーザID指定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {targetScope === "PLAN" && (
                <div className="space-y-2">
                  <Label>対象プラン</Label>
                  <Select value={planType} onValueChange={(value) => setPlanType(value as PlanType)}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {targetScope === "USER_IDS" && (
                <div className="space-y-2">
                  <Label htmlFor="admin-coins-user-ids">対象ユーザID</Label>
                  <Textarea
                    id="admin-coins-user-ids"
                    value={userIdsText}
                    onChange={(event) => setUserIdsText(event.target.value)}
                    placeholder="例: 12345, 67890 または改行区切り"
                    className="min-h-28 border-white/10 bg-white/5 text-slate-100"
                  />
                  <p className="text-sm text-slate-400">
                    カンマ、空白、改行区切りで複数指定できます。現在 {parsedUserIds.length} 件です。
                  </p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-coins-free">フリーコイン数</Label>
                  <Input
                    id="admin-coins-free"
                    type="number"
                    min="0"
                    value={freeCoins}
                    onChange={(event) => setFreeCoins(event.target.value)}
                    className="border-white/10 bg-white/5 text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-coins-premium">プレミアムコイン数</Label>
                  <Input
                    id="admin-coins-premium"
                    type="number"
                    min="0"
                    value={premiumCoins}
                    onChange={(event) => setPremiumCoins(event.target.value)}
                    className="border-white/10 bg-white/5 text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-coins-expiry">失効日時</Label>
                <Input
                  id="admin-coins-expiry"
                  type="datetime-local"
                  value={expiresAtInput}
                  onChange={(event) => setExpiresAtInput(event.target.value)}
                  disabled={operationType !== "GRANT"}
                  className="border-white/10 bg-white/5 text-slate-100 disabled:opacity-50"
                />
                <p className="text-sm text-slate-400">
                  付与時のみ使用します。減少時は入力不要です。
                </p>
              </div>

              {submitError && (
                <Alert className="rounded-[24px] border-rose-400/30 bg-rose-500/10 text-rose-100">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2Icon className="size-4 animate-spin" />
                    実行中...
                  </span>
                ) : operationType === "GRANT" ? (
                  "一括付与を実行"
                ) : (
                  "一括減少を実行"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">操作ガイド</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>対象範囲は全ユーザ、プラン別、またはユーザID指定で選択できます。</p>
              <p>減少時は各ユーザの保有量を上限に減算され、残高が負になることはありません。</p>
              <p>付与・減少の結果はコイン履歴、通知、管理画面の操作履歴に残ります。</p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">直近の実行結果</CardTitle>
            </CardHeader>
            <CardContent>
              {lastResult ? (
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>対象ユーザ数</span>
                    <span className="font-semibold text-white">{lastResult.targetCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>変更が入ったユーザ数</span>
                    <span className="font-semibold text-white">{lastResult.changedCount}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span>付与フリーコイン合計</span>
                    <span className="font-semibold text-white">{lastResult.freeGrantedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>付与プレミアムコイン合計</span>
                    <span className="font-semibold text-white">{lastResult.premiumGrantedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>減少フリーコイン合計</span>
                    <span className="font-semibold text-white">{lastResult.freeReducedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>減少プレミアムコイン合計</span>
                    <span className="font-semibold text-white">{lastResult.premiumReducedTotal}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">まだ実行結果はありません。</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">操作履歴</CardTitle>
              <CardDescription className="text-slate-400">
                最新20件を表示しています。全 {historyCount} 件
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p className="text-sm text-slate-400">読み込み中...</p>
              ) : histories.length === 0 ? (
                <p className="text-sm text-slate-400">まだ履歴はありません。</p>
              ) : (
                <div className="space-y-4">
                  {histories.map((history) => (
                    <div key={history.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {formatTargetScope(history.targetScope, history.planType)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {jstDateTimeFormatter.format(new Date(history.createdAt * 1000))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {history.freeDelta > 0 || history.premiumDelta > 0 ? "付与" : "減少"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            実行者 ID: {history.moderatorUserId}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-slate-300">
                        <p>要求値: {formatDelta(history.freeDelta, history.premiumDelta)}</p>
                        <p>対象 {history.targetCount} 件 / 変更 {history.changedCount} 件</p>
                        {(history.freeGrantedTotal > 0 || history.premiumGrantedTotal > 0) && (
                          <p>
                            実付与: フリー {history.freeGrantedTotal} / プレミアム {history.premiumGrantedTotal}
                          </p>
                        )}
                        {(history.freeReducedTotal > 0 || history.premiumReducedTotal > 0) && (
                          <p>
                            実減少: フリー {history.freeReducedTotal} / プレミアム {history.premiumReducedTotal}
                          </p>
                        )}
                        {history.expiresAt && (
                          <p>
                            失効日時: {jstDateTimeFormatter.format(new Date(history.expiresAt * 1000))}
                          </p>
                        )}
                        {history.targetScope === "USER_IDS" && history.targetUserIds.length > 0 && (
                          <p className="break-all">
                            対象ID: {history.targetUserIds.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6 rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Amazonギフト交換申請</CardTitle>
          <CardDescription className="text-slate-400">
            未承認・承認済み・コード反映済みの申請を管理できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={exchangeStatusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setExchangeStatusFilter("PENDING")}
              className={exchangeStatusFilter === "PENDING" ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}
            >
              未承認 ({pendingExchangeRequests.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={exchangeStatusFilter === "APPROVED" ? "default" : "outline"}
              onClick={() => setExchangeStatusFilter("APPROVED")}
              className={exchangeStatusFilter === "APPROVED" ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}
            >
              承認 ({approvedExchangeRequests.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={exchangeStatusFilter === "REFLECTED" ? "default" : "outline"}
              onClick={() => setExchangeStatusFilter("REFLECTED")}
              className={exchangeStatusFilter === "REFLECTED" ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"}
            >
              コード反映 ({reflectedExchangeRequests.length})
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void loadExchangeList()}
              disabled={isLoadingExchangeList}
              className="ml-auto border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
            >
              {isLoadingExchangeList ? "更新中..." : "一覧を更新"}
            </Button>
          </div>

          {isLoadingExchangeList ? (
            <p className="text-sm text-slate-400">申請一覧を読み込み中...</p>
          ) : displayedExchangeRequests.length === 0 ? (
            <p className="text-sm text-slate-400">該当する申請はありません。</p>
          ) : (
            <div className="space-y-3">
              {displayedExchangeRequests.map((request) => {
                const isPending = request.status === "PENDING"
                const currentGiftCode = giftCodeByRequestId[request.id] ?? ""

                return (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          ¥{request.amazonPointYen.toLocaleString()} 分 / {request.coinAmount.toLocaleString()} コイン
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          申請ID: {request.id}
                        </p>
                        <p className="text-xs text-slate-400">ユーザID: {request.userId}</p>
                        <p className="text-xs text-slate-400">
                          申請日時: {jstDateTimeFormatter.format(new Date(request.appliedAt * 1000))}
                        </p>
                        {request.approvedAt ? (
                          <p className="text-xs text-slate-400">
                            承認日時: {jstDateTimeFormatter.format(new Date(request.approvedAt * 1000))}
                          </p>
                        ) : null}
                      </div>

                      <span
                        className={
                          isPending
                            ? "rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300"
                            : "rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300"
                        }
                      >
                        {isPending ? "未承認" : "承認"}
                      </span>
                    </div>

                    {(request.amazonGiftCode?.trim().length ?? 0) > 0 ? (
                      <div className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3">
                        <p className="text-xs text-slate-300">反映済みコード</p>
                        <p className="select-all break-all font-mono text-sm text-white">
                          {request.amazonGiftCode}
                        </p>
                      </div>
                    ) : null}

                    {isPending ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Input
                          value={currentGiftCode}
                          onChange={(event) =>
                            setGiftCodeByRequestId((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                          placeholder="Amazonギフトコード"
                          className="border-white/10 bg-white/5 font-mono text-slate-100"
                        />
                        <Button
                          type="button"
                          onClick={() => void handleApproveExchangeRequest(request.id)}
                          disabled={approvingRequestId === request.id}
                          className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                        >
                          {approvingRequestId === request.id
                            ? "反映中..."
                            : "コードを反映して承認"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  )
}