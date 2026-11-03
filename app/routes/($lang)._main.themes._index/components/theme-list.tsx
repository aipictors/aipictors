import { Button } from "~/components/ui/button"
import { createCalendarCells } from "~/routes/($lang)._main.themes._index/utils/create-calendar-cells"
import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { getJstDate } from "~/utils/jst-date"
import { getRenderNow } from "~/utils/render-now"

type Props = {
  year: number
  month: number
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
  basePath?: string
  isSensitive?: boolean
}

/**
 * お題カレンダー
 */
export function ThemeList(props: Props) {
  const t = useTranslation()

  const basePath = props.basePath ?? "/themes"

  // カレンダーセルを生成
  const cells = createCalendarCells(props.year, props.month)

  const now = getJstDate(new Date(getRenderNow()))

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 7日後までのお題だけ見せる
  const lastVisibleDay = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 7,
  )

  const firstDayOfWeek = new Date(props.year, props.month - 1, 1).getDay()

  const previousMonth =
    props.month === 1
      ? { year: props.year - 1, month: 12 }
      : { year: props.year, month: props.month - 1 }

  const nextMonth =
    props.month === 12
      ? { year: props.year + 1, month: 1 }
      : { year: props.year, month: props.month + 1 }

  const weekDays = [
    t("日", "Sun"),
    t("月", "Mon"),
    t("火", "Tue"),
    t("水", "Wed"),
    t("木", "Thu"),
    t("金", "Fri"),
    t("土", "Sat"),
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link
            to={`${basePath}/${previousMonth.year}/${previousMonth.month}?tab=calender`}
            aria-label={t("前の月", "Previous month")}
          >
            <ChevronLeftIcon className="size-5" />
          </Link>
        </Button>
        <p className="font-bold text-lg">
          {t(
            `${props.year}年${props.month}月`,
            `${props.month}/${props.year}`,
          )}
        </p>
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link
            to={`${basePath}/${nextMonth.year}/${nextMonth.month}?tab=calender`}
            aria-label={t("次の月", "Next month")}
          >
            <ChevronRightIcon className="size-5" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn("pb-1 text-center font-semibold text-xs", {
              "text-rose-500": index === 0,
              "text-sky-500": index === 6,
              "text-muted-foreground": index !== 0 && index !== 6,
            })}
          >
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />
          }

          const date = new Date(props.year, props.month - 1, day)
          const theme = props.dailyThemes.find((item) => item.day === day)
          const isToday = date.getTime() === todayStart.getTime()
          const isFuture = date > todayStart
          const isHidden = date > lastVisibleDay
          const dayOfWeek = (day + firstDayOfWeek - 1) % 7
          const thumbnail =
            !isFuture && !props.isSensitive
              ? (theme?.firstWork?.smallThumbnailImageURL ?? null)
              : null
          const title = isHidden ? null : (theme?.title ?? null)

          return (
            <div
              key={`${props.year}-${props.month}-${day}`}
              className={cn(
                "group relative aspect-[3/4] overflow-hidden rounded-lg border md:aspect-square md:rounded-xl",
                isToday && "ring-2 ring-fuchsia-500 ring-offset-1 ring-offset-background",
                thumbnail ? "border-transparent bg-zinc-900" : "bg-card",
                isFuture && "border-dashed bg-muted/40",
              )}
            >
              {thumbnail && (
                <>
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/30" />
                </>
              )}
              {!isHidden && (
                <Link
                  to={`${basePath}/${props.year}/${props.month}/${day}?tab=list`}
                  className="absolute inset-0 z-[1]"
                  aria-label={
                    title
                      ? t(
                          `${props.month}月${day}日のお題「${title}」`,
                          `Theme for ${props.month}/${day}: ${title}`,
                        )
                      : t(`${props.month}月${day}日`, `${props.month}/${day}`)
                  }
                />
              )}
              <div className="pointer-events-none relative flex h-full flex-col justify-between p-1 md:p-2">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "font-bold text-[11px] md:text-sm",
                      thumbnail
                        ? "text-white"
                        : dayOfWeek === 0
                          ? "text-rose-500"
                          : dayOfWeek === 6
                            ? "text-sky-500"
                            : "text-foreground",
                    )}
                  >
                    {day}
                  </span>
                  {isToday ? (
                    <span className="hidden rounded-full bg-fuchsia-500 px-1.5 py-0.5 font-bold text-[10px] text-white md:inline">
                      {t("今日", "Today")}
                    </span>
                  ) : isFuture && !isHidden ? (
                    <LockIcon className="hidden size-3 text-muted-foreground md:block" />
                  ) : null}
                </div>
                {title && (
                  <div>
                    <p
                      className={cn(
                        "line-clamp-3 break-all font-bold text-[10px] leading-tight md:line-clamp-2 md:text-sm",
                        thumbnail ? "text-white drop-shadow" : "text-foreground",
                      )}
                    >
                      {title}
                    </p>
                    {theme && !isFuture && (
                      <p
                        className={cn(
                          "mt-0.5 hidden text-[10px] md:block",
                          thumbnail ? "text-white/80" : "text-muted-foreground",
                        )}
                      >
                        {t(`${theme.worksCount}作品`, `${theme.worksCount} works`)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {title && theme?.proposer && (
                <Link
                  to={`/users/${theme.proposer.id}`}
                  title={t(
                    `${theme.proposer.name}さんの提案`,
                    `Proposed by ${theme.proposer.name}`,
                  )}
                  className="absolute top-1 right-1 z-[2] hidden md:block"
                >
                  <Avatar className="size-6 border-2 border-white shadow">
                    <AvatarImage
                      resizeWidth={64}
                      src={theme.proposer.iconUrl ?? ""}
                      alt={theme.proposer.name}
                    />
                    <AvatarFallback className="text-[9px]">
                      {theme.proposer.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-muted-foreground text-xs">
        {t(
          "アイコンはそのお題を提案した人です。7日後までのお題が見られます。",
          "Icons show who proposed the theme. Themes are visible up to 7 days ahead.",
        )}
      </p>
    </div>
  )
}

export const ThemeListItemFragment = graphql(
  `fragment ThemeListItem on DailyThemeNode @_unmask {
    id
    title
    note
    dateText
    year
    month
    day
    worksCount
    firstWork {
      id
      smallThumbnailImageURL
    }
    proposer {
      id
      name
      iconUrl
    }
  }`,
)
