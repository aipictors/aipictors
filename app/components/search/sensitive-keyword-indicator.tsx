import { AlertTriangle, Shield } from "lucide-react"
import { useMemo } from "react"
import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"
import { isSensitiveKeyword } from "~/utils/is-sensitive-keyword"

type Props = {
  searchText: string
  className?: string
}

/**
 * 検索テキストがセンシティブキーワードかどうかを視覚的に表示するインジケーター
 */
export function SensitiveKeywordIndicator({ searchText, className }: Props) {
  const t = useTranslation()

  const isSensitive = useMemo(() => {
    if (!searchText.trim()) return false
    // Remove # symbols and check for sensitive keywords
    const sanitizedText = searchText.replace(/#/g, "").trim()
    return isSensitiveKeyword(sanitizedText)
  }, [searchText])

  if (!isSensitive) {
    return null
  }

  return (
    <div className={className}>
      <Badge
        variant="secondary"
        className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200"
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        {t("R18モード", "R18 Mode")}
      </Badge>
    </div>
  )
}

/**
 * 検索入力欄内に表示する小さなインジケーター
 */
export function CompactSensitiveIndicator({
  searchText,
}: {
  searchText: string
}) {
  const isSensitive = useMemo(() => {
    if (!searchText.trim()) return false
    const sanitizedText = searchText.replace(/#/g, "").trim()
    return isSensitiveKeyword(sanitizedText)
  }, [searchText])

  if (!isSensitive) {
    return null
  }

  return (
    <div className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 dark:bg-orange-900/50">
      <Shield className="h-3 w-3 text-orange-600 dark:text-orange-400" />
      <span className="font-medium text-orange-700 text-xs dark:text-orange-300">
        18+
      </span>
    </div>
  )
}
