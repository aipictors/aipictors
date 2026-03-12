import { Link } from "@remix-run/react"
import { ChevronRight, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  getRotatingItems,
  useRotatingHomeEvents,
} from "~/routes/($lang)._main._index/components/use-rotating-home-events"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export type HomePreviewEvent = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl: string
  status: string
  startAt: number
  endAt: number
  isOfficial: boolean
  rankingEnabled: boolean
  entryCount: number
  participantCount: number
  userName?: string | null
  userIconUrl?: string | null
  tags: string[]
}

type Props = {
  events: HomePreviewEvent[]
}

const getStatusClassName = (status: string) => {
  if (status === "ONGOING") {
    return "bg-red-500 text-white hover:bg-red-500/90"
  }

  if (status === "UPCOMING") {
    return "bg-sky-500 text-white hover:bg-sky-500/90"
  }

  return "bg-slate-500 text-white hover:bg-slate-500/90"
}

const formatEventDate = (unixTime: number) => {
  const date = new Date(unixTime * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}.${month}.${day}`
}

export function HomeEventPreviewList({ events }: Props) {
  const t = useTranslation()
  const { currentIndex, isVisible } = useRotatingHomeEvents(events)
  const visibleEvents = getRotatingItems(events, currentIndex, 3)

  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-sm">
            {t("開催イベント", "Current events")}
          </h2>
          <p className="mt-1 text-muted-foreground text-xs sm:block">
            {t(
              "開催中・開催予定の企画を2秒ごとに切り替えて表示しています",
              "Ongoing and upcoming events rotate every 2 seconds",
            )}
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
        >
          <Link
            to="/events"
            aria-label={t("イベント一覧へ", "Go to events")}
            title={t("イベント一覧へ", "Go to events")}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        <div
          className={cn(
            "space-y-3 transition-all duration-500 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-20 translate-y-1",
          )}
        >
          {visibleEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="group flex items-start gap-2 rounded-lg border p-2.5 transition-colors hover:bg-muted/40 sm:gap-3"
            >
              <img
                src={event.thumbnailImageUrl}
                alt=""
                className="h-12 w-12 rounded-md object-cover sm:h-14 sm:w-14"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={getStatusClassName(event.status)}>
                    {event.status === "ONGOING"
                      ? t("開催中", "Ongoing")
                      : t("開催予定", "Upcoming")}
                  </Badge>
                  <Badge variant="secondary">
                    {event.isOfficial
                      ? t("公式", "Official")
                      : t("ユーザー", "User")}
                  </Badge>
                </div>
                <div className="line-clamp-1 font-medium text-sm">
                  {event.title}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatEventDate(event.startAt)} -{" "}
                  {formatEventDate(event.endAt)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Avatar className="size-4">
                    {event.userIconUrl && (
                      <AvatarImage
                        src={withIconUrlFallback(event.userIconUrl)}
                        alt=""
                      />
                    )}
                    <AvatarFallback className="text-[9px]">
                      {(event.userName ?? "A").slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="line-clamp-1">
                    {event.userName ?? "Aipictors"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
                  <span>
                    {t("作品", "Entries")}: {event.entryCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.participantCount}
                  </span>
                  {event.tags[0] && <span>#{event.tags[0]}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {events.length === 0 && (
          <div className="rounded-lg border border-dashed p-4 text-muted-foreground text-xs">
            {t(
              "現在表示できる開催イベントはありません。",
              "There are no current events to show right now.",
            )}
          </div>
        )}
      </div>
    </div>
  )
}
