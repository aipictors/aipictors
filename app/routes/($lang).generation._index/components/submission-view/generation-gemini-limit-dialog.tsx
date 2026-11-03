import { Link } from "~/lib/app/locale-router"
import { ArrowRight, Check, Clock } from "lucide-react"
import { useState } from "react"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
import { trackGrowthEvent } from "~/utils/track-growth-event"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 選んでいるモデルの 1 枚のコイン */
  coinCost: number
  /** プレミアムコインの残高 */
  premiumBalance: number
  /** 加入中のプラン */
  passType: string | null
  /** 枠が戻る時刻（UNIX 秒） */
  resetsAt: number | null
}

/** プレミアムコインは 100 枚 80 円から（purchase-premium-coins-dialog の最小パック） */
const PREMIUM_COIN_YEN_PER_COIN = 0.8

const toResetText = (resetsAt: number | null) => {
  if (resetsAt === null) return null
  const minutes = Math.max(
    0,
    Math.round((resetsAt * 1000 - Date.now()) / 60000),
  )
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  }
}

/**
 * Gemini の今週の枠を使い切って、プレミアムコインも足りないときの案内
 * 行き止まりにしない: 待つ・コインを買う・ほかのモデルで続ける のどれでも選べるようにする
 */
export function GenerationGeminiLimitDialog(props: Props) {
  const t = useTranslation()

  const [isCoinDialogOpen, setIsCoinDialogOpen] = useState(false)

  const reset = toResetText(props.resetsAt)

  const yenPerImage = Math.round(props.coinCost * PREMIUM_COIN_YEN_PER_COIN)

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pr-6">
            <DialogTitle className="leading-snug">
              {t(
                "今週の Gemini の枠を使い切りました",
                "You've used this week's Gemini allowance",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Gemini は1枚の費用が高いので、毎日のフリーコインで作れる枚数に週の枠があります。",
                "Gemini images cost more to make, so daily free coins cover a limited number each week.",
              )}
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {reset !== null
                  ? t(
                      `あと${reset.days > 0 ? `${reset.days}日` : ""}${reset.hours}時間${reset.days > 0 ? "" : `${reset.minutes}分`}（月曜0時）で枠が戻ります`,
                      `Resets in ${reset.days > 0 ? `${reset.days}d ` : ""}${reset.hours}h${reset.days > 0 ? "" : ` ${reset.minutes}m`} (Monday midnight JST)`,
                    )
                  : t("毎週月曜0時に枠が戻ります", "Resets Monday at midnight JST")}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {t(
                  "ほかのモデルは今まで通りフリーコインで作れます",
                  "Other models still use your free coins as usual",
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <PremiumCoinIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                {t(
                  `今すぐ作るなら1枚プレミアムコイン${props.coinCost}枚（約${yenPerImage}円。残り${props.premiumBalance}枚）`,
                  `To keep going now, each image uses ${props.coinCost} premium coins (about ¥${yenPerImage}; you have ${props.premiumBalance})`,
                )}
              </span>
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                trackGrowthEvent(
                  "gemini_limit_coin_click",
                  props.passType ?? "free",
                )
                props.onOpenChange(false)
                setIsCoinDialogOpen(true)
              }}
            >
              {t("プレミアムコインを購入する", "Buy premium coins")}
            </Button>
            {(props.passType === "LITE" || props.passType === "STANDARD") && (
              <Button asChild variant="outline" className="gap-1">
                <Link
                  to="/plus"
                  onClick={() =>
                    trackGrowthEvent(
                      "gemini_limit_plan_click",
                      props.passType ?? "free",
                    )
                  }
                >
                  {props.passType === "LITE"
                    ? t(
                        "スタンダードなら1日4枚（Nano Banana 2 も）",
                        "Standard: 4 images a day, plus Nano Banana 2",
                      )
                    : t("プレミアムなら1日8枚", "Premium: 8 images a day")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" onClick={() => props.onOpenChange(false)}>
              {t("閉じる", "Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PurchasePremiumCoinsDialog
        currentBalance={props.premiumBalance}
        open={isCoinDialogOpen}
        onOpenChange={setIsCoinDialogOpen}
        hideTrigger={true}
        cancelPath="/generation"
      />
    </>
  )
}
