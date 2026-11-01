import { Link } from "@remix-run/react"
import { LockIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type StripTheme = {
  id: string
  title: string
  year: number
  month: number
  day: number
  worksCount: number
  firstWork?: { smallThumbnailImageURL: string } | null
}

type Props = {
  themes: StripTheme[]
  /** 表示中の日付（yyyy-m-d） */
  selectedKey: string
  /** 今日（日本時間）の日付（yyyy-m-d） */
  todayKey: string
  /** 表示中のお題の作品数（一覧の件数と合わせる） */
  selectedWorksCount?: number
  isSensitive: boolean
  basePath: string
}

const WEEK_DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"]
const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * 前後のお題を横に並べた帯（サムネイル付き）
 */
export function ThemeWeekStrip(props: Props) {
  const t = useTranslation()

  const scrollerRef = useRef<HTMLDivElement>(null)

  // 表示中のお題が見える位置までスクロールする
  useEffect(() => {
    const scroller = scrollerRef.current
    const selected = scroller?.querySelector<HTMLElement>("[data-selected]")
    if (!scroller || !selected) {
      return
    }
    scroller.scrollLeft =
      selected.offsetLeft - scroller.clientWidth / 2 + selected.clientWidth / 2
  }, [props.selectedKey])

  if (props.themes.length === 0) {
    return null
  }

  const [todayYear, todayMonth, todayDay] = props.todayKey
    .split("-")
    .map(Number)
  const todayTime = new Date(todayYear, todayMonth - 1, todayDay).getTime()

  return (
    <div
      ref={scrollerRef}
      className="-mx-1 flex snap-x gap-2 overflow-x-auto scroll-smooth px-1 pt-1 pb-2 [scrollbar-width:thin]"
    >
      {props.themes.map((theme) => {
        const key = `${theme.year}-${theme.month}-${theme.day}`
        const time = new Date(theme.year, theme.month - 1, theme.day).getTime()
        const isSelected = key === props.selectedKey
        const isToday = key === props.todayKey
        const isFuture = time > todayTime
        const weekDay = new Date(theme.year, theme.month - 1, theme.day).getDay()
        const worksCount =
          isSelected && props.selectedWorksCount !== undefined
            ? props.selectedWorksCount
            : theme.worksCount
        const thumbnail =
          !isFuture && !props.isSensitive
            ? (theme.firstWork?.smallThumbnailImageURL ?? null)
            : null

        return (
          <Link
            key={theme.id}
            to={`${props.basePath}/${theme.year}/${theme.month}/${theme.day}`}
            data-selected={isSelected ? "" : undefined}
            aria-current={isSelected ? "page" : undefined}
            className={cn(
              "group relative flex h-24 w-32 shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl border p-2.5 text-left transition md:w-36",
              isSelected
                ? "border-transparent ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background"
                : "hover:-translate-y-0.5 hover:shadow-md",
              isFuture
                ? "border-dashed bg-muted/60"
                : thumbnail
                  ? "bg-zinc-900 text-white"
                  : "bg-linear-to-br from-violet-500 to-fuchsia-500 text-white",
            )}
          >
            {thumbnail && (
              <>
                <img
                  src={thumbnail}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover opacity-80 transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
              </>
            )}
            <div className="relative flex items-center justify-between gap-1 text-[11px]">
              <span
                className={cn(
                  "font-semibold",
                  isFuture ? "text-muted-foreground" : "text-white/90",
                )}
              >
                {theme.month}/{theme.day}
                <span className="ml-0.5 font-normal">
                  ({t(WEEK_DAYS_JA[weekDay], WEEK_DAYS_EN[weekDay])})
                </span>
              </span>
              {isToday ? (
                <span className="rounded-full bg-fuchsia-500 px-1.5 py-0.5 font-bold text-[10px] text-white">
                  {t("今日", "Today")}
                </span>
              ) : isFuture ? (
                <LockIcon className="size-3 text-muted-foreground" />
              ) : null}
            </div>
            <div className="relative">
              <p
                className={cn(
                  "line-clamp-2 font-bold text-sm leading-tight",
                  isFuture ? "text-foreground" : "text-white drop-shadow",
                )}
              >
                {theme.title}
              </p>
              {!isFuture && (
                <p className="mt-0.5 text-[10px] text-white/80">
                  {t(`${worksCount}作品`, `${worksCount} works`)}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
