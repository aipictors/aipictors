import { AlertTriangle, CalendarDays, Megaphone } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"

type Props = {
  importantRelease: MicroCmsApiRelease | null
  events: HomePreviewEvent[]
  featuredReleases: MicroCmsApiRelease[]
  releaseList: MicroCmsApiReleaseResponse
  className?: string
}

const containsJapanese = (text: string) => /[぀-ヿ一-鿿]/.test(text)

/**
 * スマホのトップの「重要なお知らせ・開催イベント・サイトのお知らせ」を 1 行（横スクロール）にまとめた帯。
 * 3 つの枠で 1 画面目の 4 分の 1 ほどを使い、おすすめ作品が下に押し出されていた
 * （スマホのトップで深さ 20% まで届くのは 43%）
 */
export function HomeNoticeStrip(props: Props) {
  const t = useTranslation()
  const important =
    props.importantRelease &&
    !(t.isEnglish && containsJapanese(props.importantRelease.title))
      ? props.importantRelease
      : null
  // 開催中のイベントを先に（なければ予定）
  const event =
    props.events.find((item) => item.status === "ONGOING") ?? props.events[0]
  // 重要なお知らせと同じものは 2 回出さない
  const release = [
    ...props.featuredReleases,
    ...props.releaseList.contents,
  ].find((item) => item.id !== important?.id)

  const chipClassName =
    "flex h-9 max-w-[78vw] shrink-0 snap-start items-center gap-1.5 rounded-full border bg-card px-3 text-sm shadow-sm transition-colors hover:bg-muted"

  if (!important && !event && !release) return null

  return (
    <nav
      aria-label={t("お知らせ", "Notices")}
      className={cn(
        "-mx-4 flex snap-x gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        props.className,
      )}
    >
      {important && (
        <Link
          to={`/releases/${important.id}`}
          className={cn(
            chipClassName,
            "border-rose-300/70 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/40",
          )}
        >
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-600 px-1.5 py-0.5 font-bold text-[10px] text-white dark:bg-rose-500">
            <AlertTriangle className="size-3" />
            {t("重要", "Notice")}
          </span>
          <span className="truncate font-medium">{important.title}</span>
        </Link>
      )}
      {event && (
        <Link to={`/events/${event.slug}`} className={chipClassName}>
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-muted-foreground text-xs">
            {event.status === "ONGOING"
              ? t("開催中", "Ongoing")
              : t("予定", "Upcoming")}
          </span>
          <span className="truncate">{t.text(event.title)}</span>
        </Link>
      )}
      {release && (
        <Link to={`/releases/${release.id}`} className={chipClassName}>
          <Megaphone className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{t.text(release.title)}</span>
        </Link>
      )}
      <Link
        to="/events"
        className={cn(chipClassName, "text-muted-foreground text-xs")}
      >
        {t("イベント一覧", "All events")}
      </Link>
      <Link
        to="/releases"
        className={cn(chipClassName, "text-muted-foreground text-xs")}
      >
        {t("お知らせ一覧", "All news")}
      </Link>
    </nav>
  )
}
