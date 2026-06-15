import { gql, useMutation, useQuery } from "@apollo/client/index"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json } from "@remix-run/cloudflare"
import { Coins, Loader2Icon, Shield } from "lucide-react"
import { useContext, useState } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { AdminPageShell } from "~/components/admin-page-shell"
import { AuthContext } from "~/contexts/auth-context"
import { createMeta } from "~/utils/create-meta"
import { toast } from "sonner"

const pageDescription = "全ユーザまたはプラン別ユーザに対してコインを一括で付与・減少します。"

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
    $freeDelta: Int
    $premiumDelta: Int
    $expiresAt: Int
  ) {
    adminAdjustCoins(
      targetScope: $targetScope
      planType: $planType
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

type OperationType = "GRANT" | "REDUCE"
type TargetScope = "ALL" | "PLAN"
type PlanType = "FREE" | "TWO_DAYS" | "LITE" | "STANDARD" | "PREMIUM"

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
      enDescription: "Bulk grant or reduce coins for all users or a plan segment.",
      isIndex: false,
    },
    undefined,
    props.params.lang,
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  return json({})
}

export default function AdminCoinsPage() {
  const authContext = useContext(AuthContext)
  const [operationType, setOperationType] = useState<OperationType>("GRANT")
  const [targetScope, setTargetScope] = useState<TargetScope>("ALL")
  const [planType, setPlanType] = useState<PlanType>("FREE")
  const [freeCoins, setFreeCoins] = useState("0")
  const [premiumCoins, setPremiumCoins] = useState("0")
  const [expiresAtInput, setExpiresAtInput] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const { data: viewerData, loading: viewerLoading } = useQuery(viewerQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
  })

  const [mutate, { loading: isSubmitting }] = useMutation(adminAdjustCoinsMutation)

  const hasPermission = Boolean(viewerData?.viewer?.isModerator)

  const parsedFreeCoins = Math.max(0, Number.parseInt(freeCoins || "0", 10) || 0)
  const parsedPremiumCoins = Math.max(0, Number.parseInt(premiumCoins || "0", 10) || 0)
  const requiresExpiry = operationType === "GRANT" && (parsedFreeCoins > 0 || parsedPremiumCoins > 0)

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
      toast.success("コイン操作を実行しました。")
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
              <p>対象範囲は全ユーザ、またはプラン別で選択できます。</p>
              <p>減少時は各ユーザの保有量を上限に減算され、残高が負になることはありません。</p>
              <p>付与・減少の結果はコイン履歴と通知に残ります。</p>
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
        </div>
      </div>
    </AdminPageShell>
  )
}