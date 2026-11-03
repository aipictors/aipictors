import { Link } from "@remix-run/react"
import { ThumbsUpIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 推薦バナー
 */
export function RecommendedBanner() {
  const t = useTranslation()

  return (
    <Link
      to="/plus"
      className="flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/60"
    >
      <ThumbsUpIcon className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        {t(
          "STANDARDプラン以上で、好きな作品を推薦して多くの人にシェアできます",
          "With STANDARD or higher, you can recommend posts you love and share them widely",
        )}
      </span>
    </Link>
  )
}
