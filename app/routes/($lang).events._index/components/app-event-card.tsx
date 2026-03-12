import { Link } from "@remix-run/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardHeader } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { useEventDateTimeText } from "~/routes/($lang).events._index/hooks/use-event-date-time-text"
import { getJstDate } from "~/utils/jst-date"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

export type EventCardItem = {
  id: string
  slug: string
  title: string
  description: string
  thumbnailImageUrl: string
  startAt: number
  endAt: number
  tags: string[]
  status: string
  isOfficial: boolean
  rankingEnabled: boolean
  entryCount: number
  participantCount: number
  userId?: string | null
  userName?: string | null
  userIconUrl?: string | null
}

type Props = {
  appEvent: EventCardItem
}

export function AppEventCard(props: Props) {
  const appEvent = props.appEvent

  const t = useTranslation()

  const now = getJstDate(new Date())

  const isOngoing = appEvent.status === "ONGOING"

  const isUpcoming = appEvent.status === "UPCOMING"

  const remainingDays = Math.max(
    0,
    Math.ceil(
      (new Date(appEvent.endAt * 1000).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )

  const startAt = useEventDateTimeText(appEvent.startAt)

  const endAt = useEventDateTimeText(appEvent.endAt)

  const plainDescription = appEvent.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const statusLabel = isOngoing
    ? t("開催中", "Ongoing")
    : isUpcoming
      ? t("開催予定", "Upcoming")
      : t("終了", "Ended")

  return (
    <Link className="w-full" to={`/events/${appEvent.slug}`}>
      <Card className="h-full w-full">
        <CardHeader className="w-full">
          <div className="relative flex items-center">
            <div className="m-auto">
              <img
                className="m-auto h-24 max-w-auto rounded-lg object-cover"
                src={appEvent.thumbnailImageUrl}
                alt=""
              />
              <div
                className={`absolute top-0 left-0 rounded-br-lg px-2 py-1 font-bold text-white text-xs ${
                  isOngoing
                    ? "bg-red-500"
                    : isUpcoming
                      ? "bg-sky-500"
                      : "bg-slate-500"
                }`}
              >
                {statusLabel}
              </div>
              <div className="absolute top-0 right-0 rounded-bl-lg bg-black/70 px-2 py-1 font-medium text-white text-xs">
                {appEvent.isOfficial
                  ? t("公式イベント", "Official Event")
                  : t("ユーザー企画", "User Event")}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">{appEvent.title}</div>
            <div className="text-muted-foreground text-xs">
              {startAt}～{endAt}
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              {appEvent.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-1">
                  #{tag}
                </span>
              ))}
            </div>
            {plainDescription.length > 0 && (
              <div className="line-clamp-2 text-muted-foreground text-xs">
                {plainDescription}
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
              <span>
                {t("作品", "Entries")}: {appEvent.entryCount}
              </span>
              <span>
                {t("参加者", "Participants")}: {appEvent.participantCount}
              </span>
              <span>
                {appEvent.rankingEnabled
                  ? t("ランキングあり", "Ranking enabled")
                  : t("ランキングなし", "No ranking")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Avatar className="size-4">
                {appEvent.userIconUrl && (
                  <AvatarImage
                    src={withIconUrlFallback(appEvent.userIconUrl)}
                    alt=""
                  />
                )}
                <AvatarFallback className="text-[9px]">
                  {(appEvent.userName ?? "A").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="line-clamp-1">
                {t("主催", "Host")}: {appEvent.userName ?? "Aipictors"}
              </span>
            </div>
            <div className="text-xs">
              {isOngoing
                ? t("残り{{count}}日", "{{count}} days left").replace(
                    "{{count}}",
                    remainingDays.toString(),
                  )
                : isUpcoming
                  ? t("開始前のイベントです", "This event has not started yet")
                  : t("アーカイブを閲覧できます", "Archive available")}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
