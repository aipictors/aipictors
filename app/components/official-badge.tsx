import { BadgeCheck } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  className?: string
}

/**
 * 公式アカウント（運営・モデレーター）の名前の横に出す青いチェック
 */
export function OfficialBadge(props: Props) {
  return (
    <span
      className="inline-flex shrink-0 items-center"
      title="公式アカウント"
      role="img"
      aria-label="公式アカウント"
    >
      <BadgeCheck
        aria-hidden="true"
        className={cn("size-4 fill-[#1D9BF0] text-white", props.className)}
      />
    </span>
  )
}
