import { useLocation } from "react-router-dom"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

export function R18ModeIndicator() {
  const location = useLocation()
  const t = useTranslation()

  // URLに"/r"が含まれているかチェック
  const isR18Mode = /\/r($|\/)/.test(location.pathname)

  if (!isR18Mode) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-white shadow-lg",
        "animate-pulse",
      )}
    >
      <span className="text-sm">🔞</span>
      <span className="font-semibold text-sm">
        {t("R18モード", "R18 Mode")}
      </span>
    </div>
  )
}
