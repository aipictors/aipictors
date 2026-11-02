import { Sparkles } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { GeminiAllowance } from "~/routes/($lang).generation._index/hooks/use-gemini-allowance"

type Props = {
  allowance: GeminiAllowance
  /** 選んでいるモデルの 1 枚のコイン */
  coinCost: number
  /** プレミアムコインの残高 */
  premiumBalance: number
}

/**
 * Gemini を選んでいるときの「今日の枠」の表示
 * 枠を超えるとプレミアムコインを使うので、押す前に残りが分かるようにする
 */
export function GenerationGeminiAllowanceNotice(props: Props) {
  const t = useTranslation()

  const { allowance, coinCost } = props

  if (allowance.dailyLimit <= 0) {
    return null
  }

  const limitImages = Math.floor(allowance.dailyLimit / coinCost)

  if (!allowance.isEnforced) {
    return (
      <p className="flex items-start gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-muted-foreground text-xs leading-relaxed">
        <Sparkles className="mt-0.5 size-3.5 shrink-0" />
        <span>
          {t(
            `12月1日から、毎日のフリーコインで作れる Gemini は1日${limitImages}枚までになります（超えた分はプレミアムコインで作れます。ほかのモデルは変わりません）`,
            `From Dec 1, daily free coins cover up to ${limitImages} Gemini images a day. Premium coins cover the rest. Other models don't change.`,
          )}
        </span>
      </p>
    )
  }

  const remainingImages = Math.floor(allowance.remaining / coinCost)
  const usedRate = Math.min(100, (allowance.used / allowance.dailyLimit) * 100)

  return (
    <div className="space-y-1 rounded-md bg-muted px-2.5 py-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="size-3.5 shrink-0" />
          {t("今日の Gemini の枠", "Today's Gemini allowance")}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            remainingImages === 0 &&
              "font-medium text-orange-600 dark:text-orange-400",
          )}
        >
          {t(
            `あと${remainingImages}枚 / ${limitImages}枚`,
            `${remainingImages} of ${limitImages} left`,
          )}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${usedRate}%` }}
        />
      </div>
      {remainingImages === 0 && (
        <p className="text-muted-foreground leading-relaxed">
          {t(
            `0時に枠が戻ります。今すぐ作るときは1枚プレミアムコイン${coinCost}枚（残り${props.premiumBalance}枚）`,
            `Resets at midnight JST. To keep going now, each image uses ${coinCost} premium coins (you have ${props.premiumBalance}).`,
          )}
        </p>
      )}
    </div>
  )
}
