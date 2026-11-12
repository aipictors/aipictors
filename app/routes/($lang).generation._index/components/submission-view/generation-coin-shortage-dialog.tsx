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
import { usePassCheckout } from "~/hooks/use-pass-checkout"
import { useTranslation } from "~/hooks/use-translation"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
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

  useEffect(() => {
    if (props.open) trackGrowthEvent("shortage_view", source)
  }, [props.open])

  const next = toNextGrantText()

  // 加入中なら上のプランだけを出す
  const currentIndex = PLANS.findIndex((plan) => plan.type === props.passType)
  const plans = PLANS.filter((_, index) => index > currentIndex)

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-6">
            <DialogTitle className="leading-snug">
              {isFree && props.affordableImages === 0
                ? t(
                    "今日の無料分（10枚）を使い切りました",
                    "You've used today's 10 free images",
                  )
                : t("コインが足りません", "Not enough coins")}
            </DialogTitle>
            <DialogDescription>
              {isFree
                ? props.isExistedPreviousPass
                  ? t(
                      "おかえりなさい！今なら初月半額でプランに戻れます。1回4枚・1日最大200枚まで作れます。",
                      "Welcome back! Rejoin a plan for 4 images per run and up to 200 a day.",
                    )
                  : t(
                      "プランなら、このまま続けて作れます。1回で4枚まとめて生成でき、初月は半額です。",
                      "Keep creating with a plan: 4 images per run, and your first month is 50% off.",
                    )
                : t(
                    "上のプランにすると、毎日のコインが増えます。コインを買って続けることもできます。",
                    "Upgrade for more daily coins, or buy coins to keep going.",
                  )}
            </DialogDescription>
          </DialogHeader>

          {props.affordableImages > 0 && (
            <p className="rounded-lg bg-muted p-2 text-sm">
              {t(
                `今のコインで、あと${props.affordableImages}枚作れます。同時生成枚数を${props.affordableImages}枚以下にしてください。`,
                `You can still make ${props.affordableImages} image(s). Lower the number of images per run.`,
              )}
            </p>
          )}

          {isFree && (
            // 選択肢を並べると選ばれなかったので、いちばん安い入り方（ライト・初月半額）を主役にして、押したらそのまま決済へ進む
            <div className="space-y-2">
              <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-sky-500/10 p-4 dark:border-violet-400">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {t("ライトプラン", "Lite plan")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t(
                        `2か月目から${LITE.price}/月（税込）`,
                        `Then ${LITE.price}/mo (tax incl.)`,
                      )}
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="mr-1 rounded-md bg-fuchsia-600 px-1.5 py-0.5 font-bold text-white text-xs">
                      {t("初月半額", "50% off")}
                    </span>
                    <span className="font-extrabold text-3xl text-fuchsia-600 tracking-tight dark:text-fuchsia-300">
                      {LITE.firstMonth}
                    </span>
                  </p>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  {[
                    t("1回で4枚（無料は1枚）", "4 per run (1 on Free)"),
                    t(
                      `1日${LITE.perDay}枚（無料は10枚）`,
                      `${LITE.perDay} a day (10 on Free)`,
                    ),
                    t("広告なし", "No ads"),
                    t("画像から生成", "Image-to-image"),
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-1">
                      <Check className="size-3 shrink-0 text-violet-500" />
                      {text}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={checkout.isLoading}
                  onClick={() => {
                    trackGrowthEvent("shortage_checkout_LITE", source)
                    void checkout.startCheckout("LITE")
                  }}
                  className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 dark:text-white"
                >
                  {checkout.isLoadingFor("LITE") ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t(
                      `初月${LITE.firstMonth}で続ける（決済へ）`,
                      `Continue for ${LITE.firstMonth} (checkout)`,
                    )
                  )}
                </Button>
                <p className="mt-2 text-center text-muted-foreground text-xs">
                  {t(
                    "いつでも解約できます（解約後も更新日まで使えます）",
                    "Cancel anytime (benefits last until the renewal date).",
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.filter((plan) => plan.type !== "LITE").map((plan) => (
                  <button
                    type="button"
                    key={plan.type}
                    disabled={checkout.isLoading}
                    onClick={() => {
                      trackGrowthEvent(`shortage_checkout_${plan.type}`, source)
                      void checkout.startCheckout(plan.type)
                    }}
                    className="rounded-xl border p-2.5 text-left transition-colors hover:bg-muted disabled:opacity-60"
                  >
                    <span className="flex items-center justify-between gap-1 font-bold text-sm">
                      {t(plan.name[0], plan.name[1])}
                      {checkout.isLoadingFor(plan.type) && (
                        <Loader2 className="size-3 animate-spin" />
                      )}
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      {t(
                        `1日${plan.perDay}枚・優先して生成`,
                        `${plan.perDay}/day, priority queue`,
                      )}
                    </span>
                    <span className="block text-xs">
                      <span className="font-bold text-fuchsia-600 dark:text-fuchsia-300">
                        {t(`初月${plan.firstMonth}`, `${plan.firstMonth} 1st mo`)}
                      </span>
                      <span className="text-muted-foreground">
                        {t(`・以降${plan.price}/月`, `, then ${plan.price}/mo`)}
                      </span>
                    </span>
                  </button>
                ))}
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
                          {t("人気", "Popular")}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {t(
                        `1日${plan.perDay}枚・1回4枚・広告なし`,
                        `${plan.perDay}/day, 4 per run, no ads`,
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
                          {t("/初月", "/1st mo")}
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
                        t("決済へ進む →", "Checkout →")
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
                    "Standard and above get priority in the queue and fast mode",
                  )}
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
              {plans.length > 0 && (
                <Link
                  to="/plus#plans"
                  onClick={() => {
                    trackGrowthEvent("shortage_plans", source)
                    props.onOpenChange(false)
                  }}
                  className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Sparkles className="size-3.5" />
                  {t("プランを比べる（年払いあり）", "Compare plans (yearly available)")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  trackGrowthEvent("shortage_coins", source)
                  props.onOpenChange(false)
                  setIsCoinDialogOpen(true)
                }}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t(
                  "コインだけ買う（100コイン80円〜）",
                  "Buy coins only (from ¥80)",
                )}
              </button>
            </div>
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Clock className="size-3" />
              {isFree
                ? t(
                    `無料のままなら、あと${next.hours}時間${next.minutes}分で100コイン（10枚分）が届きます`,
                    `Staying on Free? 100 coins arrive again in ${next.hours}h ${next.minutes}m`,
                  )
                : t(
                    `あと${next.hours}時間${next.minutes}分で、毎日のコインが届きます`,
                    `Daily coins arrive in ${next.hours}h ${next.minutes}m`,
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
