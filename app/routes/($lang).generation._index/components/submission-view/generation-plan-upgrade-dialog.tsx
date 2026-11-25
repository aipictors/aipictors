import { Check, Loader2, Sparkles } from "lucide-react"
import { useEffect, useRef } from "react"
import { PlanChangeConfirm } from "~/components/plan-upsell/member-limit-upsell"
import { TrialTerms } from "~/components/trial-terms"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { useMemberPlanChange } from "~/hooks/use-member-plan-change"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  closeGenerationPlanUpgrade,
  isGenerationPlanUpgradeHost,
  registerGenerationPlanUpgradeHost,
  useGenerationPlanUpgradeRequest,
} from "~/routes/($lang).generation._index/utils/generation-plan-upgrade-store"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  /** 加入中のプラン（無料なら null） */
  passType: string | null
}

const PLANS = [
  {
    type: "LITE",
    name: ["ライト", "Lite"],
    price: "¥480",
    firstMonth: "¥240",
    features: [
      ["1日50枚・1回4枚", "50 a day · 4 per click"],
      ["画像から生成・大きいサイズ", "Image-to-image · larger sizes"],
    ],
  },
  {
    type: "STANDARD",
    name: ["スタンダード", "Standard"],
    price: "¥1,980",
    firstMonth: "¥990",
    features: [
      ["1日100枚・同時生成・予約生成", "100 a day · parallel · queued runs"],
      ["優先生成・Nano Banana 2", "Priority · Nano Banana 2"],
    ],
  },
  {
    type: "PREMIUM",
    name: ["プレミアム", "Premium"],
    price: "¥3,980",
    firstMonth: "¥1,990",
    features: [
      ["1日200枚・優先生成", "200 a day · priority"],
      ["スタンダードの機能すべて", "Everything in Standard"],
    ],
  },
] as const

/**
 * プランが必要な操作をしたときの案内（openGenerationPlanUpgrade で開く）
 * 必要なプラン以上で、今より上のプランを並べて、押したらそのまま決済へ進める
 */
export function GenerationPlanUpgradeDialog(props: Props) {
  const t = useTranslation()

  const hostId = useRef(Symbol("generation-plan-upgrade"))
  useEffect(() => registerGenerationPlanUpgradeHost(hostId.current), [])

  const request = useGenerationPlanUpgradeRequest()
  const isOpen = request !== null && isGenerationPlanUpgradeHost(hostId.current)

  const checkout = usePassCheckout()

  // 加入中の人は新しく契約せず、今の契約を変える（二重の契約にならないように。今日の請求額を見せてから）
  const memberPassType =
    props.passType === "LITE" ||
    props.passType === "STANDARD" ||
    props.passType === "PREMIUM"
      ? props.passType
      : null
  const change = useMemberPlanChange(memberPassType)

  const isFree =
    props.passType === null ||
    !PLANS.some((plan) => plan.type === props.passType)

  const liteOffer = useLiteOffer().offer
  const isTrial = isFree && liteOffer === "trial"

  const currentIndex = PLANS.findIndex((plan) => plan.type === props.passType)
  const requiredIndex = PLANS.findIndex(
    (plan) => plan.type === request?.requiredPlan,
  )
  const plans = PLANS.filter(
    (_, index) => index > currentIndex && index >= requiredIndex,
  )

  const source = request?.source ?? "unknown"
  const userKind = isFree ? "free" : `pass_${props.passType}`

  useEffect(() => {
    if (!isOpen) {
      change.reset()
      return
    }
    trackGrowthEvent(`plan_gate_view_${source}`, userKind)
  }, [isOpen, source])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeGenerationPlanUpgrade()
      }}
    >
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
            {request?.title}
          </DialogTitle>
          <DialogDescription>
            {request?.description ??
              t(
                "プランに入ると、このまま続けて使えます。",
                "Join a plan to use this right away.",
              )}
          </DialogDescription>
        </DialogHeader>

        {memberPassType !== null && change.preview !== null ? (
          <PlanChangeConfirm
            change={change}
            currentPassType={memberPassType}
            source={`plan_gate_${source}`}
          />
        ) : (
          <div className="space-y-2">
            {plans.map((plan, index) => {
              const isTrialPlan = isTrial && plan.type === "LITE"
              return (
                <button
                  type="button"
                  key={plan.type}
                  disabled={checkout.isLoading}
                  onClick={() => {
                    trackGrowthEvent(
                      `plan_gate_checkout_${plan.type}`,
                      `${source}:${userKind}`,
                    )
                    if (isTrialPlan) {
                      trackGrowthEvent("trial_checkout", "plan_gate")
                      void checkout.startTrialCheckout()
                      return
                    }
                    if (memberPassType !== null) {
                      void change.loadPreview(plan.type, `plan_gate_${source}`)
                      return
                    }
                    void checkout.startCheckout(plan.type)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors hover:bg-muted disabled:opacity-60",
                    index === 0 && "border-2 border-violet-500/70",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 font-bold">
                      {t(plan.name[0], plan.name[1])}
                      {index === 0 && (
                        <span className="rounded-full bg-violet-600 px-2 py-0.5 font-normal text-white text-xs">
                          {t("これで使えます", "Unlocks this")}
                        </span>
                      )}
                      {isTrialPlan && (
                        <span className="rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                          {t(
                            `${TRIAL_DAYS}日間無料`,
                            `${TRIAL_DAYS} days free`,
                          )}
                        </span>
                      )}
                    </div>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground text-xs">
                      {plan.features.map((feature) => (
                        <li key={feature[0]} className="flex items-start gap-1">
                          <Check className="mt-0.5 size-3 shrink-0 text-violet-500" />
                          {t(feature[0], feature[1])}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 text-right font-bold">
                    {isTrialPlan ? (
                      <>
                        <span className="text-fuchsia-600 dark:text-fuchsia-300">
                          {t("無料", "Free")}
                        </span>
                        <div className="font-normal text-muted-foreground text-xs">
                          {t(`その後${plan.price}/月`, `then ${plan.price}/mo`)}
                        </div>
                      </>
                    ) : isFree ? (
                      <>
                        <span className="text-fuchsia-600 dark:text-fuchsia-300">
                          {plan.firstMonth}
                        </span>
                        <span className="font-normal text-muted-foreground text-xs">
                          {t("/初月", " first month")}
                        </span>
                        <div className="font-normal text-muted-foreground text-xs">
                          {t(`2か月目から${plan.price}`, `then ${plan.price}`)}
                        </div>
                      </>
                    ) : (
                      <>
                        {plan.price}
                        <span className="font-normal text-muted-foreground text-xs">
                          {t("/月", "/mo")}
                        </span>
                      </>
                    )}
                    <div className="mt-0.5 font-normal text-fuchsia-600 text-xs dark:text-fuchsia-300">
                      {checkout.isLoadingFor(plan.type) ||
                      (memberPassType !== null &&
                        change.loading === "preview") ? (
                        <Loader2 className="ml-auto size-3 animate-spin" />
                      ) : memberPassType !== null ? (
                        t("プランを変更 →", "Switch plan →")
                      ) : (
                        t("決済へ進む →", "Checkout →")
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
            {isTrial && plans.some((plan) => plan.type === "LITE") ? (
              <TrialTerms />
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">
                {t("いつでも解約できます", "Cancel anytime")}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm">
          <Link
            to="/plus#plans"
            target="_blank"
            onClick={() => trackGrowthEvent("plan_gate_plans", source)}
            className="inline-flex min-h-9 items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <Sparkles className="size-3.5" />
            {t("プランを比べる（年払いあり）", "Compare all plans")}
          </Link>
          <button
            type="button"
            onClick={closeGenerationPlanUpgrade}
            className="min-h-9 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("今はしない", "Not now")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
