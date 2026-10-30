import { BadgeCheck } from "lucide-react"
import { cn } from "~/lib/utils"

type Props = {
  isOfficial?: boolean | null
  isModerator?: boolean | null
  className?: string
}

/**
 * 名前の横に出すマーク
 * 公式アカウント（運営）は青いチェック、モデレーターはオレンジのチェック
 */
export function OfficialBadge(props: Props) {
  if (!props.isOfficial && !props.isModerator) {
    return null
  }

  const label = props.isOfficial ? "公式アカウント" : "モデレーター"

  return (
    <span
      className="inline-flex shrink-0 items-center"
      title={label}
      role="img"
      aria-label={label}
    >
      <BadgeCheck
        aria-hidden="true"
        className={cn(
          "size-4 text-white",
          props.isOfficial ? "fill-[#1D9BF0]" : "fill-[#F97316]",
          props.className,
        )}
      />
    </span>
  )
}
