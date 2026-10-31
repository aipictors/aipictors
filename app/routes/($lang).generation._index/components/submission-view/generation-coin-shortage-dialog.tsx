import { Link } from "@remix-run/react"
import { Check, Clock, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"
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
                      "続けて作るなら、プランかコインの購入がおすすめです。プランなら1回で4枚まとめて生成できます。今なら初月半額です。",
                      "Keep creating with a plan or coins. Plans make 4 images per run, and your first month is 50% off.",
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

          {plans.length > 0 && (
            <div className="space-y-2">
              {plans.map((plan) => (
                <Link
                  key={plan.type}
                  to="/plus#plans"
                  onClick={() => {
                    trackGrowthEvent(`shortage_plan_${plan.type}`, source)
                    props.onOpenChange(false)
                  }}
                  className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted"
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
                  </div>
                </Link>
              ))}
              <ul className="space-y-1 pt-1 text-muted-foreground text-xs">
                <li className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t("いつでも解約できます", "Cancel anytime")}
                </li>
                <li className="flex items-center gap-1">
                  <Check className="size-3" />
                  {t(
                    "画像から生成・高速生成モードも使えます",
                    "Image-to-image and fast mode included",
                  )}
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-2">
            {plans.length > 0 && (
              <Button asChild className="w-full gap-2">
                <Link
                  to="/plus#plans"
                  onClick={() => {
                    trackGrowthEvent("shortage_plans", source)
                    props.onOpenChange(false)
                  }}
                >
                  <Sparkles className="size-4" />
                  {t("プランを選ぶ", "Choose a plan")}
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                trackGrowthEvent("shortage_coins", source)
                props.onOpenChange(false)
                setIsCoinDialogOpen(true)
              }}
            >
              {t(
                "コインを買って続ける（100コイン80円〜）",
                "Buy coins to continue (from ¥80)",
              )}
            </Button>
            <p className="flex items-center justify-center gap-1 text-muted-foreground text-xs">
              <Clock className="size-3" />
              {isFree
                ? t(
                    `あと${next.hours}時間${next.minutes}分で、また100コイン（10枚分）が届きます`,
                    `100 free coins arrive again in ${next.hours}h ${next.minutes}m`,
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
