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

  if (allowance.weeklyLimit <= 0) {
    return null
  }

  const limitImages = Math.floor(allowance.weeklyLimit / coinCost)

  const remainingImages = Math.floor(allowance.remaining / coinCost)
  const usedRate = Math.min(100, (allowance.used / allowance.weeklyLimit) * 100)

  return (
    <div className="space-y-1 rounded-md bg-muted px-2.5 py-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="size-3.5 shrink-0" />
          {t("今週の Gemini の枠", "This week's Gemini allowance")}
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
            `月曜0時に枠が戻ります。今すぐ作るときは1枚プレミアムコイン${coinCost}枚（残り${props.premiumBalance}枚）`,
            `Resets Monday at midnight JST. To keep going now, each image uses ${coinCost} premium coins (you have ${props.premiumBalance}).`,
          )}
        </p>
      )}
    </div>
  )
}
