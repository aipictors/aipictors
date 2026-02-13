import { Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

// 閉じたバナーの状態を保存/取得
const CHARACTER_EXPRESSION_BANNER_KEY = "character-expression-banner-dismissed"

const isBannerDismissed = (): boolean => {
  if (typeof window === "undefined") return false
  try {
    const dismissed = localStorage.getItem(CHARACTER_EXPRESSION_BANNER_KEY)
    return dismissed === "true"
  } catch {
    return false
  }
}

const setBannerDismissed = (): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CHARACTER_EXPRESSION_BANNER_KEY, "true")
  } catch {
    // localStorage が使えない場合は何もしない
  }
}

/**
 * キャラクター表情生成の案内バナー
 */
export function CharacterExpressionBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const t = useTranslation()

  // コンポーネントマウント時に過去に閉じたかチェック
  useEffect(() => {
    if (isBannerDismissed()) {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setBannerDismissed()
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="border-primary/20 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="relative w-full px-4 py-3">
        <div className="flex items-center gap-3 pr-10">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="-translate-y-1/2 absolute top-1/2 right-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={t("バナーを閉じる", "Close banner")}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="flex-shrink-0 rounded-full bg-primary/20 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
