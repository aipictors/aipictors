import { Coins, Loader2Icon } from "lucide-react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Link } from "~/lib/app/locale-router"
import type { AdminCoinsPageState } from "~/routes/($lang)._main.admin.coins/hooks/use-admin-coins-page"
import {
  type OperationType,
  planOptions,
  type PlanType,
  type TargetScope,
} from "~/routes/($lang)._main.admin.coins/utils/admin-coins-utils"

/**
 * 一括コイン操作のフォーム
 */
export function AdminCoinsOperationForm(
  props: Pick<
    AdminCoinsPageState,
    | "expiresAtInput"
    | "freeCoins"
    | "isSubmitting"
    | "onSubmit"
    | "operationType"
    | "parsedUserIds"
    | "planType"
    | "premiumCoins"
    | "setExpiresAtInput"
    | "setFreeCoins"
    | "setOperationType"
    | "setPlanType"
    | "setPremiumCoins"
    | "setTargetScope"
    | "setUserIdsText"
    | "submitError"
    | "targetScope"
    | "userIdsText"
  >,
) {
  const {
    expiresAtInput,
    freeCoins,
    isSubmitting,
    onSubmit,
    operationType,
    parsedUserIds,
    planType,
    premiumCoins,
    setExpiresAtInput,
    setFreeCoins,
    setOperationType,
    setPlanType,
    setPremiumCoins,
    setTargetScope,
    setUserIdsText,
    submitError,
    targetScope,
    userIdsText,
  } = props

  return (
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
                onValueChange={(value) =>
                  setOperationType(value as OperationType)
                }
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
              <Select
                value={planType}
                onValueChange={(value) => setPlanType(value as PlanType)}
              >
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
                カンマ、空白、改行区切りで複数指定できます。現在{" "}
                {parsedUserIds.length} 件です。
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
  )
}
