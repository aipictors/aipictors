import { gql, useQuery } from "@apollo/client/index"
import { getAuth, getIdToken } from "firebase/auth"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Link, useLoaderData, useNavigate } from "@remix-run/react"
import {
  Coins,
  History,
  Loader2Icon,
  Search,
} from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { AdminPageShell } from "~/components/admin-page-shell"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"

const PAGE_SIZE = 100

const pageDescription =
  "指定ユーザのコイン消費・付与・失効履歴、累計残高、失効予定 lot を期間指定つきで確認できます。"

const viewerQuery = gql`
  query AdminCoinHistoriesViewer {
    viewer {
      id
      isModerator
    }
  }
`

type LoaderData = {
  userId: string
  from: string
  to: string
  offset: number
}

type AdminCoinHistoryItem = {
  id: number
  userId: string
  coinType: "FREE" | "PREMIUM"
  delta: number
  kind: string
  reason: string | null
  source: string | null
  createdAt: number
  expiresAt: number | null
  runningFreeBalance: number
  runningPremiumBalance: number
  runningTotalBalance: number
}

type AdminCoinHistoryLot = {
  id: number
  coinType: "FREE" | "PREMIUM"
  amount: number
  expiresAt: number | null
  createdAt: number
}

type AdminCoinHistoryResult = {
  items: AdminCoinHistoryItem[]
  totalCount: number
  offset: number
  limit: number
  summary: {
    matchedUserCount: number
    freeGrantedTotal: number
    premiumGrantedTotal: number
    freeConsumedTotal: number
    premiumConsumedTotal: number
    freeExpiredTotal: number
    premiumExpiredTotal: number
  }
  currentBalance: {
    freeBalance: number
    premiumBalance: number
    totalBalance: number
  } | null
  expiringLots: AdminCoinHistoryLot[]
}

type ApiResponse = {
  error: string | null
  data: AdminCoinHistoryResult | null
}

type AppliedFilters = {
  userId: string
  from: string
  to: string
  offset: number
}

export const meta: MetaFunction = (props) => {
  return createMeta(
    {
      title: "コイン履歴",
      enTitle: "Admin Coin Histories",
      description: pageDescription,
      enDescription:
        "Inspect coin grants, consumption, expiry, balances, and expiring lots with moderator filters.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const offset = Math.max(
    0,
    Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
  )

  return json<LoaderData>({
    userId: url.searchParams.get("userId") ?? "",
    from: url.searchParams.get("from") ?? "",
    to: url.searchParams.get("to") ?? "",
    offset,
  })
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

const toUnixSeconds = (value: string) => {
  if (!value) {
    return null
  }

  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return null
  }

  return Math.floor(time / 1000)
}

const formatKind = (kind: string) => {
  switch (kind) {
    case "INITIAL_GRANT":
      return "初回付与"
    case "GRANT":
      return "付与"
    case "CONSUME":
      return "消費"
    case "EXPIRE":
      return "失効"
    default:
      return kind
  }
}

const buildSearchParams = (filters: AppliedFilters) => {
  const params = new URLSearchParams()

  if (filters.userId.trim()) {
    params.set("userId", filters.userId.trim())
  }

  if (filters.from) {
    params.set("from", filters.from)
  }

  if (filters.to) {
    params.set("to", filters.to)
  }

  if (filters.offset > 0) {
    params.set("offset", String(filters.offset))
  }

  return params
}

export default function AdminCoinHistoriesPage() {
  const loaderData = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const [userIdInput, setUserIdInput] = useState(loaderData.userId)
  const [fromInput, setFromInput] = useState(loaderData.from)
  const [toInput, setToInput] = useState(loaderData.to)
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    userId: loaderData.userId,
    from: loaderData.from,
    to: loaderData.to,
    offset: loaderData.offset,
  })
  const [result, setResult] = useState<AdminCoinHistoryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn || !hasPermission) {
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const currentUser = getAuth().currentUser
        if (!currentUser) {
          throw new Error("ログイン情報を確認できませんでした。")
        }

        const idToken = await getIdToken(currentUser)
        const params = new URLSearchParams({
          offset: String(appliedFilters.offset),
          limit: String(PAGE_SIZE),
        })

        if (appliedFilters.userId.trim()) {
          params.set("userId", appliedFilters.userId.trim())
        }

        const from = toUnixSeconds(appliedFilters.from)
        const to = toUnixSeconds(appliedFilters.to)

        if (from !== null) {
          params.set("from", String(from))
        }

        if (to !== null) {
          params.set("to", String(to))
        }

        const response = await fetch(`/api/admin/coins/history?${params.toString()}`, {
          headers: {
            authorization: `Bearer ${idToken}`,
          },
        })

        const json = (await response.json()) as ApiResponse
        if (!response.ok || json.error || json.data === null) {
          throw new Error(json.error ?? "コイン履歴の取得に失敗しました。")
        }

        if (!cancelled) {
          setResult(json.data)
        }
      } catch (error) {
        if (!cancelled) {
          setResult(null)
          setErrorMessage(
            error instanceof Error ? error.message : "コイン履歴の取得に失敗しました。",
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [appliedFilters, authContext.isLoading, authContext.isNotLoggedIn, hasPermission])

  const hasPreviousPage = appliedFilters.offset > 0
  const hasNextPage = useMemo(() => {
    if (!result) {
      return false
    }

    return appliedFilters.offset + result.items.length < result.totalCount
  }, [appliedFilters.offset, result])

  const onApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextFilters = {
      userId: userIdInput,
      from: fromInput,
      to: toInput,
      offset: 0,
    } satisfies AppliedFilters

    setAppliedFilters(nextFilters)
    navigate({ search: buildSearchParams(nextFilters).toString() }, { replace: true })
  }

  const movePage = (direction: "prev" | "next") => {
    const nextOffset = direction === "prev"
      ? Math.max(0, appliedFilters.offset - PAGE_SIZE)
      : appliedFilters.offset + PAGE_SIZE

    const nextFilters = {
      ...appliedFilters,
      offset: nextOffset,
    }

    setAppliedFilters(nextFilters)
    navigate({ search: buildSearchParams(nextFilters).toString() }, { replace: true })
  }

  if (authContext.isLoading || viewerLoading) {
    return (
      <AdminPageShell title="コイン履歴" description={pageDescription} icon={History}>
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardContent className="py-8 text-sm text-slate-400">読み込み中...</CardContent>
        </Card>
      </AdminPageShell>
    )
  }

  if (authContext.isNotLoggedIn) {
    return (
      <AdminPageShell title="コイン履歴" description={pageDescription} icon={History}>
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
      <AdminPageShell title="コイン履歴" description={pageDescription} icon={History}>
        <Alert className="rounded-[28px] border-white/10 bg-white/5 text-slate-100">
          <AlertDescription className="text-slate-300">
            このページはモデレーターのみ利用できます。
          </AlertDescription>
        </Alert>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell title="コイン履歴" description={pageDescription} icon={History}>
      <div className="space-y-6">
        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="size-5 text-cyan-300" />
              フィルタ
            </CardTitle>
            <CardDescription className="text-slate-400">
              ユーザIDと期間で台帳を絞り込みます。ユーザIDを指定すると現在残高と有効な lot も表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onApplyFilters} className="grid gap-5 lg:grid-cols-[minmax(0,220px)_minmax(0,240px)_minmax(0,240px)_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="admin-coin-history-user-id">ユーザID</Label>
                <Input
                  id="admin-coin-history-user-id"
                  value={userIdInput}
                  onChange={(event) => setUserIdInput(event.target.value)}
                  placeholder="例: 64536"
                  className="border-white/10 bg-white/5 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-coin-history-from">期間開始</Label>
                <Input
                  id="admin-coin-history-from"
                  type="datetime-local"
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                  className="border-white/10 bg-white/5 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-coin-history-to">期間終了</Label>
                <Input
                  id="admin-coin-history-to"
                  type="datetime-local"
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                  className="border-white/10 bg-white/5 text-slate-100"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  絞り込む
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => {
                    setUserIdInput("")
                    setFromInput("")
                    setToInput("")
                    const nextFilters = { userId: "", from: "", to: "", offset: 0 }
                    setAppliedFilters(nextFilters)
                    navigate({ search: "" }, { replace: true })
                  }}
                >
                  クリア
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {errorMessage ? (
          <Alert className="rounded-[28px] border-rose-400/30 bg-rose-500/10 text-rose-100">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none xl:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Coins className="size-5 text-cyan-300" />
                集計
              </CardTitle>
              <CardDescription className="text-slate-400">
                マッチ件数 {result?.totalCount ?? 0} 件 / 対象ユーザ {result?.summary.matchedUserCount ?? 0} 人
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">フリー付与</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.freeGrantedTotal ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">プレミアム付与</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.premiumGrantedTotal ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">フリー消費</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.freeConsumedTotal ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">プレミアム消費</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.premiumConsumedTotal ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">フリー失効</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.freeExpiredTotal ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">プレミアム失効</div>
                <div className="mt-2 font-semibold text-xl text-white">{result?.summary.premiumExpiredTotal ?? 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">現在残高</CardTitle>
              <CardDescription className="text-slate-400">
                ユーザIDを指定した場合のみ表示します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result?.currentBalance ? (
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>フリー</span>
                    <span className="font-semibold text-white">{result.currentBalance.freeBalance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>プレミアム</span>
                    <span className="font-semibold text-white">{result.currentBalance.premiumBalance}</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span>合計</span>
                    <span className="font-semibold text-white">{result.currentBalance.totalBalance}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">ユーザIDを指定してください。</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <History className="size-5 text-cyan-300" />
                  コイン台帳一覧
                </CardTitle>
                <CardDescription className="text-slate-400">
                  1ページ {PAGE_SIZE} 件まで。累計はそのユーザのその時点の残高です。
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasPreviousPage || isLoading}
                  className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => movePage("prev")}
                >
                  前へ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!hasNextPage || isLoading}
                  className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => movePage("next")}
                >
                  次へ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2Icon className="size-4 animate-spin" />
                読み込み中...
              </div>
            ) : result && result.items.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">日時</th>
                      <th className="px-4 py-3 text-left font-medium">ユーザID</th>
                      <th className="px-4 py-3 text-left font-medium">種別</th>
                      <th className="px-4 py-3 text-left font-medium">コイン</th>
                      <th className="px-4 py-3 text-left font-medium">増減</th>
                      <th className="px-4 py-3 text-left font-medium">累計</th>
                      <th className="px-4 py-3 text-left font-medium">失効</th>
                      <th className="px-4 py-3 text-left font-medium">理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item) => (
                      <tr key={item.id} className="border-t border-white/10 align-top text-slate-200">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {jstDateTimeFormatter.format(new Date(item.createdAt * 1000))}
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/users?userId=${item.userId}`} className="underline underline-offset-2">
                            {item.userId}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-white/10 text-slate-100 hover:bg-white/10">
                            {formatKind(item.kind)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{item.coinType === "FREE" ? "フリー" : "プレミアム"}</td>
                        <td className={`px-4 py-3 font-semibold ${item.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          {item.delta > 0 ? `+${item.delta}` : item.delta}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{item.runningTotalBalance}</div>
                          <div className="text-xs text-slate-400">
                            F {item.runningFreeBalance} / P {item.runningPremiumBalance}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                          {item.expiresAt
                            ? jstDateTimeFormatter.format(new Date(item.expiresAt * 1000))
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div>{item.reason ?? "-"}</div>
                          {item.source ? (
                            <div className="mt-1 text-xs text-slate-500">{item.source}</div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">該当する履歴はありません。</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-white/5 text-slate-100 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">有効な失効予定 lot</CardTitle>
            <CardDescription className="text-slate-400">
              ユーザIDを指定した場合のみ、残っている lot を古い失効順で表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result?.expiringLots.length ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">lot ID</th>
                      <th className="px-4 py-3 text-left font-medium">コイン</th>
                      <th className="px-4 py-3 text-left font-medium">残数</th>
                      <th className="px-4 py-3 text-left font-medium">作成日時</th>
                      <th className="px-4 py-3 text-left font-medium">失効日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.expiringLots.map((lot) => (
                      <tr key={lot.id} className="border-t border-white/10 text-slate-200">
                        <td className="px-4 py-3">{lot.id}</td>
                        <td className="px-4 py-3">{lot.coinType === "FREE" ? "フリー" : "プレミアム"}</td>
                        <td className="px-4 py-3">{lot.amount}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {jstDateTimeFormatter.format(new Date(lot.createdAt * 1000))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {lot.expiresAt
                            ? jstDateTimeFormatter.format(new Date(lot.expiresAt * 1000))
                            : "無期限"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">表示できる active lot はありません。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  )
}