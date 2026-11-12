import { Crown } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  currentPlan?: IntrospectionEnum<"PassType"> | null
  className?: string
}

/**
 * プランアップグレードを促すさりげないUIコンポーネント
 */
export function PlanUpgradePrompt ({ currentPlan, className }: Props) {
  const t = useTranslation()

  const getUpgradeMessage = (plan?: IntrospectionEnum<"PassType"> | null) => {
    switch (plan) {
      case "LITE":
        return t("スタンダードで50ページまで", "Standard: up to 50 pages")
      case "STANDARD":
        return t("プレミアムで100ページまで", "Premium: up to 100 pages")
      case "PREMIUM":
        return null // プレミアムプランは最上位なので表示しない
      default:
        return t("ライトで30ページまで", "Lite: up to 30 pages")
    }
  }

  const upgradeMessage = getUpgradeMessage(currentPlan)

  if (!upgradeMessage) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 px-1 py-0.5 text-gray-500 text-xs dark:text-gray-400",
        className,
      )}
    >
      <span>{upgradeMessage}</span>
      <Link to="/plus">
        <button
          type="button"
          className="flex items-center gap-0.5 rounded px-1 py-0.5 text-gray-600 text-xs hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Crown className="h-2.5 w-2.5" />
          UP
        </button>
      </Link>
    </div>
  )
}
