import { Heart } from "lucide-react"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  freeCoinAmount: number
  premiumCoinAmount: number
  totalPt: number
  className?: string
}

/**
 * 推しコインの合計と内訳（フリーコインとプレミアムコインは価値が違うので分けて見せる）
 */
export function SupportCoinBreakdown(props: Props) {
  const t = useTranslation()

  return (
    <div className={cn("flex flex-wrap items-center gap-1", props.className)}>
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 font-bold text-rose-600 text-xs dark:text-rose-300">
        <Heart className="size-3 fill-current" />
        {props.totalPt.toLocaleString()}pt
      </span>
      {props.premiumCoinAmount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700 text-xs dark:text-amber-300">
          <PremiumSupportCoinIcon className="size-3.5" />
          {t(
            `プレミアム ${props.premiumCoinAmount.toLocaleString()}枚`,
            `Premium ×${props.premiumCoinAmount.toLocaleString()}`,
          )}
        </span>
      )}
      {props.freeCoinAmount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs">
          <FreeSupportCoinIcon className="size-3.5" />
          {t(
            `フリー ${props.freeCoinAmount.toLocaleString()}枚`,
            `Free ×${props.freeCoinAmount.toLocaleString()}`,
          )}
        </span>
      )}
    </div>
  )
}
