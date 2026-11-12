import { Link } from "~/lib/app/locale-router"
import { Check, Clock, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { TrialTerms } from "~/components/trial-terms"
import { TRIAL_DAYS, useLiteOffer } from "~/hooks/use-lite-offer"
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { useTranslation } from "~/hooks/use-translation"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 加入中のプラン（無料なら null） */
  passType: string | null
  /** 以前プランに入っていた */
  isExistedPreviousPass: boolean
  /** 今のコイン残高 */
  totalBalance: number
  /** 今のコインで作れる枚数（枚数を減らせば作れるとき） */
  affordableImages: number
}

const PLANS = [
  {
    type: "LITE",
    name: ["ライト", "Lite"],
    price: "¥480",
    firstMonth: "¥240",
    perDay: 50,
  },
  {
    type: "STANDARD",
    name: ["スタンダード", "Standard"],
    price: "¥1,980",
    firstMonth: "¥990",
    perDay: 100,
  },
  {
    type: "PREMIUM",
    name: ["プレミアム", "Premium"],
    price: "¥3,980",
    firstMonth: "¥1,990",
    perDay: 200,
  },
] as const

const LITE = PLANS[0]

/**
 * 次に毎日のコインが届くまでの時間（日本時間の 0 時）
 */
const toNextGrantText = () => {
  const now = new Date()
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
  const next = new Date(jst)
  next.setDate(next.getDate() + 1)
  next.setHours(0, 0, 0, 0)
  const minutes = Math.max(0, Math.round((next.getTime() - jst.getTime()) / 60000))
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 }
}

/**
 * コインが足りなくて生成できないときの案内
 * 以前は「コイン残高が不足しています。」のトーストだけで、続けて作る方法（プラン・コイン購入）を出していなかった。
 * 無料の上限まで使う人は毎日数十人いて、いちばん課金につながりやすい場面なので、ここで選択肢を出す
 */
export function GenerationCoinShortageDialog (props: Props) {
  const t = useTranslation()

  const [isCoinDialogOpen, setIsCoinDialogOpen] = useState(false)

  const checkout = usePassCheckout()

  const isFree = props.passType === null

  // 今プランに入っていない人は初月半額（以前入っていた人も）
  const isFirstMonthOffer = isFree

  const source = isFree
    ? props.isExistedPreviousPass
      ? "lapsed"
      : "free"
    : `pass_${props.passType}`

  // ライトは、はじめての人には 7 日間無料お試し、以前入っていた人には初月半額（確認中はどちらとも書かない）
  const liteOffer = useLiteOffer().offer
  const isTrial = isFree && liteOffer === "trial"
  const isHalf = isFree && liteOffer === "half"

  useEffect(() => {
    if (!props.open) return
    trackGrowthEvent("shortage_view", source)
    if (isTrial) trackGrowthEvent("trial_view", "shortage")
    if (isHalf) trackGrowthEvent("trial_ineligible", "shortage")
  }, [props.open])

  const next = toNextGrantText()

  // 加入中なら上のプランだけを出す
  const currentIndex = PLANS.findIndex((plan) => plan.type === props.passType)
  const plans = PLANS.filter((_, index) => index > currentIndex)

  return (
    <>
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
              {isFree && props.affordableImages === 0
                ? t(
                    "今日の無料分を使い切りました",
                    "That's your 10 free images for today",
                  )
                : t("コインが足りません", "Not enough coins")}
            </DialogTitle>
            <DialogDescription>
              {isFree
                ? props.isExistedPreviousPass
                  ? t(
                      "おかえりなさい！今なら初月半額でプランに戻れます。1回4枚・1日最大200枚まで作れます。",
                      "Welcome back! Your first month is half price again — 4 images per click, up to 200 a day.",
                    )
                  : t(
                      "無料は1日10枚までです。プランなら、このまま続けて作れます。",
                      "Free covers 10 images a day. A plan lets you keep going right now.",
                    )
                : t(
                    "上のプランにすると、毎日のコインが増えます。コインを買って続けることもできます。",
                    "A higher plan gives you more coins every day. You can also buy coins to keep going.",
                  )}
            </DialogDescription>
          </DialogHeader>

          {props.affordableImages > 0 && (
            <p className="rounded-lg bg-muted p-2 text-sm">
              {t(
                `今のコインで、あと${props.affordableImages}枚作れます。同時生成枚数を${props.affordableImages}枚以下にしてください。`,
                `You still have coins for ${props.affordableImages} more. Lower the number of images per click to ${props.affordableImages} or fewer.`,
              )}
            </p>
          )}

          {isFree && (
            // 選択肢を並べると選ばれなかったので、いちばん始めやすい入り方（ライト。はじめての人は 7 日間無料、以前入っていた人は初月半額）を主役にして、押したらそのまま決済へ進む
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 dark:border-violet-400">
                {/* /plus のプランのカードと同じ並び（印 → 初月の金額 → 2 か月目からの金額） */}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold leading-tight">
                    {t("ライトプラン", "Lite plan")}
                  </p>
                  {(isTrial || isHalf) && (
                    <span className="inline-block whitespace-nowrap rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                      {isTrial
                        ? t("無料お試し", "Free trial")
                        : t("初月半額", "50% off first month")}
                    </span>
                  )}
                </div>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                  <span
                    className={cn(
                      "font-extrabold text-3xl leading-tight tracking-tight",
                      (isTrial || isHalf) &&
                        "text-fuchsia-600 dark:text-fuchsia-300",
                    )}
                  >
                    {isTrial
                      ? t(`${TRIAL_DAYS}日間無料`, `${TRIAL_DAYS} days free`)
                      : isHalf
                        ? LITE.firstMonth
                        : LITE.price}
                  </span>
                  {isHalf && (
                    <span className="text-muted-foreground text-sm line-through">
                      {LITE.price}
                    </span>
                  )}
                  <span className="text-foreground/80 text-xs">
                    {isTrial
                      ? t(
                          `その後 ${LITE.price}/月（税込）`,
                          `then ${LITE.price}/mo (${toApproxUsdText(480)})`,
                        )
                      : isHalf
                        ? t(
                            `2か月目から${LITE.price}/月（税込）`,
                            `then ${LITE.price}/mo (${toApproxUsdText(480)})`,
                          )
                        : t("/月（税込）", `/mo (${toApproxUsdText(480)})`)}
                  </span>
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {[
                    t("1回で4枚まとめて", "4 images per click"),
                    t(
                      `1日${LITE.perDay}枚まで`,
                      `${LITE.perDay} images a day`,
                    ),
                    t("無料より先に生成", "Ahead of free users"),
                    t("広告なし", "No ads"),
                    t("画像から生成", "Image-to-image"),
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-1.5">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={checkout.isLoading}
                  onClick={() => {
                    if (isTrial) {
                      trackGrowthEvent("trial_checkout", "shortage")
                      void checkout.startTrialCheckout()
                      return
                    }
                    trackGrowthEvent("shortage_checkout_LITE", source)
                    void checkout.startCheckout("LITE")
                  }}
                  className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.98] dark:text-white"
                >
                  {checkout.isLoadingFor("LITE") ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("決済画面へ移動中…", "Opening checkout…")}
                    </>
                  ) : isTrial ? (
                    t(
                      `${TRIAL_DAYS}日間無料で続ける`,
                      `Keep creating — ${TRIAL_DAYS} days free`,
                    )
                  ) : isHalf ? (
                    t(
                      `初月${LITE.firstMonth}で続ける`,
                      `Keep creating for ${LITE.firstMonth}`,
                    )
                  ) : (
                    t("ライトで続ける", "Keep creating with Lite")
                  )}
                </Button>
                {isTrial ? (
                  <TrialTerms className="mt-2" />
                ) : (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    {t(
                      "いつでも解約できます",
                      "Cancel anytime · charged in JPY",
                    )}
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-muted-foreground text-xs">
                  {t("もっと作りたい方に", "Need more?")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PLANS.filter((plan) => plan.type !== "LITE").map((plan) => (
                    <button
                      type="button"
                      key={plan.type}
                      disabled={checkout.isLoading}
                      onClick={() => {
                        trackGrowthEvent(
                          `shortage_checkout_${plan.type}`,
                          source,
                        )
                        void checkout.startCheckout(plan.type)
                      }}
                      className="flex h-full flex-col items-start rounded-xl border bg-card p-3 text-left transition-colors hover:border-violet-500/60 hover:bg-muted/60 disabled:opacity-60 motion-reduce:transition-none"
                    >
                      <span className="flex w-full items-center justify-between gap-1 font-bold text-sm">
                        {t(plan.name[0], plan.name[1])}
                        {checkout.isLoadingFor(plan.type) && (
                          <Loader2 className="size-3.5 animate-spin" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground text-xs">
                        {t(
                          `1日${plan.perDay}枚・優先生成`,
                          `${plan.perDay} a day · priority`,
                        )}
                      </span>
                      <span className="mt-1.5 block font-bold text-fuchsia-600 text-sm dark:text-fuchsia-300">
                        {plan.firstMonth}
                        <span className="ml-1 font-normal text-[11px] text-muted-foreground">
                          {t("初月", "first month")}
                        </span>
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {t(`2か月目から${plan.price}/月`, `then ${plan.price}/mo`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isFree && plans.length > 0 && (
            <div className="space-y-2">
              {plans.map((plan) => (
                // 押したらそのまま決済へ（以前は /plus に移るだけで、表示 217 回に対してプランのクリックは 4 回だった）
                <button
                  type="button"
                  key={plan.type}
                  disabled={checkout.isLoading}
                  onClick={() => {
                    trackGrowthEvent(`shortage_checkout_${plan.type}`, source)
                    void checkout.startCheckout(plan.type)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors hover:bg-muted disabled:opacity-60",
                    plan.type === "LITE" && "border-fuchsia-500/60",
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold">
                      {t(plan.name[0], plan.name[1])}
                      {plan.type === "STANDARD" && (
                        <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 font-normal text-white text-xs">
                          {t("おすすめ", "Recommended")}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t(
                        `1日${plan.perDay}枚・1回4枚・広告なし`,
                        `${plan.perDay} a day · 4 per click · no ads`,
                      )}
                    </div>
                  </div>
                  <div className="text-right font-bold">
                    {isFirstMonthOffer ? (
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
                      {checkout.isLoadingFor(plan.type) ? (
                        <Loader2 className="ml-auto size-3 animate-spin" />
                      ) : (
                        t("決済へ進む →", "Go to checkout →")
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <ul className="space-y-1 pt-1 text-muted-foreground text-xs">
                <li className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t("いつでも解約できます", "Cancel anytime")}
                </li>
                <li className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t(
                    "スタンダード以上は優先して生成され、高速生成モードも使えます",
                    "Standard and Premium get queue priority and fast mode",
                  )}
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm">
              {plans.length > 0 && (
                <Link
                  to="/plus#plans"
                  onClick={() => {
                    trackGrowthEvent("shortage_plans", source)
                    props.onOpenChange(false)
                  }}
                  className="inline-flex min-h-9 items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Sparkles className="size-3.5" />
                  {t("プランを比べる（年払いあり）", "Compare all plans")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  trackGrowthEvent("shortage_coins", source)
                  props.onOpenChange(false)
                  setIsCoinDialogOpen(true)
                }}
                className="min-h-9 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t(
                  "コインだけ買う（100コイン80円〜）",
                   `Just buy coins (from ¥80, ${toApproxUsdText(80)})`,
                )}
              </button>
            </div>
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Clock className="size-3" />
              {isFree
                ? t(
                    `無料のままなら、あと${next.hours}時間${next.minutes}分で100コイン（10枚分）が届きます`,
                    `Or wait: your next 100 free coins arrive in ${next.hours}h ${next.minutes}m`,
                  )
                : t(
                    `あと${next.hours}時間${next.minutes}分で、毎日のコインが届きます`,
                    `Your next daily coins arrive in ${next.hours}h ${next.minutes}m`,
                  )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <PurchasePremiumCoinsDialog
        currentBalance={props.totalBalance}
        open={isCoinDialogOpen}
        onOpenChange={setIsCoinDialogOpen}
        hideTrigger={true}
        cancelPath="/generation"
      />
    </>
  )
}
