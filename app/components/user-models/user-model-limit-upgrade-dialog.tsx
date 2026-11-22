import { CrownIcon, Loader2Icon } from "lucide-react"
import { useEffect } from "react"
import { TrialTerms } from "~/components/trial-terms"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { Link } from "~/lib/app/locale-router"
import { USER_MODEL_PLAN_LIMITS } from "~/lib/user-models/constants"
import {
  formatModelQuotaBytes,
  formatModelQuotaReset,
} from "~/lib/user-models/types"
import { cn } from "~/lib/utils"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 今月登録したファイルの合計サイズ（バイト） */
  used: number
  /** 今月登録できる合計サイズ（バイト） */
  limit: number
  /** 枠が戻る日時（UNIX 秒） */
  resetsAt?: number
  /** 加入中のプラン（無料なら null） */
  planType: string | null
  /** 「プランを比べる」のリンクの開き方（生成画面のダイアログからは別タブ） */
  linkTarget?: string
}

const PLANS = [
  { type: "LITE", name: "ライト", price: "¥480", firstMonth: "¥240" },
  {
    type: "STANDARD",
    name: "スタンダード",
    price: "¥1,980",
    firstMonth: "¥990",
  },
  {
    type: "PREMIUM",
    name: "プレミアム",
    price: "¥3,980",
    firstMonth: "¥1,990",
  },
] as const

/**
 * モデルの登録容量が今月の上限に達しているとき（ファイルが残りに収まらないとき）の案内
 * 以前はアップロードのボタンを押してもトーストだけ（アップロード画面ではボタンが押せないだけ）で、
 * 続ける方法が分からなかったので、上のプランを並べて押したらそのまま決済へ進めるようにする
 */
export function UserModelLimitUpgradeDialog(props: Props) {
  const checkout = usePassCheckout()

  const isFree =
    props.planType === null ||
    !PLANS.some((plan) => plan.type === props.planType)

  const liteOffer = useLiteOffer().offer
  const isTrial = isFree && liteOffer === "trial"

  const source = isFree ? "free" : `pass_${props.planType}`

  // 加入中なら上のプランだけを出す
  const currentIndex = PLANS.findIndex((plan) => plan.type === props.planType)
  const plans = PLANS.filter((_, index) => index > currentIndex)

  useEffect(() => {
    if (!props.open) return
    trackGrowthEvent("model_limit_view", source)
  }, [props.open])

  const resetText = formatModelQuotaReset(props.resetsAt)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className="max-h-[92dvh] max-w-md overflow-y-auto outline-none focus:outline-none focus-visible:outline-none"
        onOpenAutoFocus={(event) => {
          // 開いた直後に最初のボタンへフォーカスの輪が出て、押した後のように見えるのを避ける
          event.preventDefault()
          if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.focus()
          }
        }}
      >
        <DialogHeader className="pr-6">
          <DialogTitle className="text-balance leading-snug">
            今月のモデル登録容量の上限です（
            {formatModelQuotaBytes(props.used)} /{" "}
            {formatModelQuotaBytes(props.limit)}）
          </DialogTitle>
          <DialogDescription>
            {plans.length > 0
              ? `プランを上げると、すぐに続けて登録できます。待つ場合は ${resetText} に枠が戻ります。`
              : `${resetText} に枠が戻ります。登録したモデルは削除できません。`}
          </DialogDescription>
        </DialogHeader>

        {plans.length > 0 && (
          <div className="space-y-2">
            {plans.map((plan) => {
              const isTrialPlan = isTrial && plan.type === "LITE"
              return (
                <button
                  type="button"
                  key={plan.type}
                  disabled={checkout.isLoading}
                  onClick={() => {
                    trackGrowthEvent(
                      `model_limit_checkout_${plan.type}`,
                      source,
                    )
                    if (isTrialPlan) {
                      trackGrowthEvent("trial_checkout", "model_limit")
                      void checkout.startTrialCheckout()
                      return
                    }
                    void checkout.startCheckout(plan.type)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors hover:bg-muted disabled:opacity-60",
                    plan === plans[0] && "border-violet-500/60",
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold">
                      {plan.name}
                      {isTrialPlan && (
                        <span className="rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                          {TRIAL_DAYS}日間無料
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      モデルを毎月 {USER_MODEL_PLAN_LIMITS[plan.type]}GB
                      まで登録（個数は無制限）
                    </div>
                  </div>
                  <div className="text-right font-bold">
                    {isTrialPlan ? (
                      <>
                        <span className="text-fuchsia-600 dark:text-fuchsia-300">
                          無料
                        </span>
                        <div className="font-normal text-muted-foreground text-xs">
                          その後{plan.price}/月
                        </div>
                      </>
                    ) : isFree ? (
                      <>
                        <span className="text-fuchsia-600 dark:text-fuchsia-300">
                          {plan.firstMonth}
                        </span>
                        <span className="font-normal text-muted-foreground text-xs">
                          /初月
                        </span>
                        <div className="font-normal text-muted-foreground text-xs">
                          2か月目から{plan.price}
                        </div>
                      </>
                    ) : (
                      <>
                        {plan.price}
                        <span className="font-normal text-muted-foreground text-xs">
                          /月
                        </span>
                      </>
                    )}
                    <div className="mt-0.5 font-normal text-fuchsia-600 text-xs dark:text-fuchsia-300">
                      {checkout.isLoadingFor(plan.type) ? (
                        <Loader2Icon className="ml-auto size-3 animate-spin" />
                      ) : (
                        "決済へ進む →"
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
            {isTrial ? (
              <TrialTerms />
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">
                いつでも解約できます
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm">
          {plans.length > 0 && (
            <Link
              to="/plus#plans"
              target={props.linkTarget}
              onClick={() => {
                trackGrowthEvent("model_limit_plans", source)
                props.onOpenChange(false)
              }}
              className="inline-flex min-h-9 items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <CrownIcon className="size-3.5" />
              プランを比べる（年払いあり）
            </Link>
          )}
          <button
            type="button"
            onClick={() => props.onOpenChange(false)}
            className="min-h-9 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {resetText} まで待つ
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
