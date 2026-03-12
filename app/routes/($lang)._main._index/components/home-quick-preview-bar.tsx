import { Link } from "@remix-run/react"
import { ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import { useRotatingHomeEvents } from "~/routes/($lang)._main._index/components/use-rotating-home-events"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  events: HomePreviewEvent[]
  releaseList: MicroCmsApiReleaseResponse
}

const formatEventDate = (unixTime: number) => {
  const date = new Date(unixTime * 1000)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}.${day}`
}

const formatReleaseDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}.${day}`
}

export function HomeQuickPreviewBar(props: Props) {
  const t = useTranslation()
  const { currentIndex, isVisible } = useRotatingHomeEvents(props.events)

  const firstEvent = props.events[currentIndex]
  const firstRelease = props.releaseList.contents[0]

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="rounded-xl border bg-card px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-xs">
              {t("開催イベント", "Current events")}
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-full"
          >
            <Link
              to="/events"
              aria-label={t("イベント一覧へ", "Go to events")}
              title={t("イベント一覧へ", "Go to events")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {firstEvent ? (
          <div
            className={cn(
              "transition-all duration-500 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-20 translate-y-1",
            )}
          >
            <Link
              to={`/events/${firstEvent.slug}`}
              className="mt-1.5 block rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Badge className="shrink-0 px-1.5 py-0 text-[10px]">
                  {firstEvent.status === "ONGOING"
                    ? t("開催中", "Ongoing")
                    : t("予定", "Upcoming")}
                </Badge>
                <span className="line-clamp-1 min-w-0 flex-1 text-sm">
                  {firstEvent.title}
                </span>
              </div>
              <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                {formatEventDate(firstEvent.startAt)} -{" "}
                {formatEventDate(firstEvent.endAt)}
                {firstEvent.tags[0] ? ` ・ #${firstEvent.tags[0]}` : ""}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Avatar className="size-4">
                  {firstEvent.userIconUrl && (
                    <AvatarImage
                      src={withIconUrlFallback(firstEvent.userIconUrl)}
                      alt=""
                    />
                  )}
                  <AvatarFallback className="text-[9px]">
                    {(firstEvent.userName ?? "A").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="line-clamp-1">
                  {firstEvent.userName ?? "Aipictors"}
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-1.5 px-1 py-0.5 text-muted-foreground text-xs">
            {t("表示できるイベントはありません", "There are no events to show")}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-xs">
              {t("サイトのお知らせ", "Site announcements")}
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-full"
          >
            <Link
              to="/releases"
              aria-label={t("お知らせ一覧へ", "Go to announcements")}
              title={t("お知らせ一覧へ", "Go to announcements")}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {firstRelease ? (
          <Link
            to={`/releases/${firstRelease.id}`}
            className="mt-1.5 block rounded-md px-1 py-0.5 transition-colors hover:bg-muted/40"
          >
            <div className="line-clamp-1 text-sm">{firstRelease.title}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {formatReleaseDate(firstRelease.createdAt)}
            </div>
          </Link>
        ) : (
          <div className="mt-1.5 px-1 py-0.5 text-muted-foreground text-xs">
            {t(
              "表示できるお知らせはありません",
              "There are no announcements to show",
            )}
          </div>
        )}
      </div>
    </div>
  )
}
