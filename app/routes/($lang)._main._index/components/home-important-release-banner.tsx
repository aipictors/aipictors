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

  return (
    <Link
      to={`/releases/${props.release.id}`}
      className="block rounded-2xl border border-rose-300/80 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-100 px-4 py-3 shadow-sm transition-all hover:border-rose-400 hover:shadow-md dark:border-rose-900/80 dark:from-rose-950/70 dark:via-zinc-950 dark:to-orange-950/60 dark:hover:border-rose-700"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-rose-600 p-2 text-white shadow-sm dark:bg-rose-500">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-600 px-2.5 py-1 font-bold text-[10px] tracking-[0.18em] text-white dark:bg-rose-500">
              IMPORTANT
            </span>
            <p className="font-semibold text-rose-950 text-sm dark:text-rose-100">
              {t("重要なお知らせ", "Important notice")}
            </p>
          </div>
          <p className="mt-2 line-clamp-2 font-medium text-foreground text-sm sm:text-base">
            {props.release.title}
          </p>
          {publishedAtText && (
            <p className="mt-1 text-[11px] text-rose-900/80 dark:text-rose-200/80 sm:text-xs">
              {t("掲載日時", "Published")}: {publishedAtText}
            </p>
          )}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-rose-700 dark:text-rose-300" />
      </div>
    </Link>
  )
}