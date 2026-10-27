import { Link } from "@remix-run/react"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import type { MicroCmsApiRelease } from "~/types/micro-cms-release-response"
import { getReleasePublishedAtMs } from "~/utils/micro-cms-release"

type Props = {
  release: MicroCmsApiRelease
}

const formatReleaseDateTime = (release: MicroCmsApiRelease) => {
  const publishedAtMs = getReleasePublishedAtMs(release)

  if (publishedAtMs === null) {
    return null
  }

  // サーバー（UTC）とブラウザで同じ文字になるよう、日本時間に固定してから UTC の値で取り出す
  // （食い違うと hydration が失敗してページ全体を作り直し、表示が遅くなる）
  const date = new Date(publishedAtMs + 9 * 60 * 60 * 1000)
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hour = String(date.getUTCHours()).padStart(2, "0")
  const minute = String(date.getUTCMinutes()).padStart(2, "0")

  return `${month}.${day} ${hour}:${minute}`
}

export function HomeImportantReleaseBanner(props: Props) {
  const t = useTranslation()
  const publishedAtText = formatReleaseDateTime(props.release)

  // 1 行の細い帯にする（以前は 3 行の大きな枠で、スマホでは 1 画面目の多くを使っていた）
  return (
    <Link
      to={`/releases/${props.release.id}`}
      className="flex items-center gap-2 rounded-full border border-rose-300/70 bg-rose-50/80 py-1.5 pr-3 pl-1.5 text-sm transition-colors hover:border-rose-400 hover:bg-rose-50 dark:border-rose-900/70 dark:bg-rose-950/40 dark:hover:border-rose-700"
    >
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 font-bold text-[11px] text-white dark:bg-rose-500">
        <AlertTriangle className="size-3" />
        {t("重要", "Notice")}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
        {props.release.title}
      </span>
      {publishedAtText && (
        <span className="hidden shrink-0 text-muted-foreground text-xs sm:inline">
          {publishedAtText}
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-rose-700 dark:text-rose-300" />
    </Link>
  )
}
