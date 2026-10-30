import { Link } from "@remix-run/react"
import { CalendarDays, ImageIcon, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
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

const DAY_MS = 1000 * 60 * 60 * 24

export function AppEventCard(props: Props) {
  const appEvent = props.appEvent

  const t = useTranslation()

  const now = getJstDate(new Date())

  const isOngoing = appEvent.status === "ONGOING"

  const isUpcoming = appEvent.status === "UPCOMING"

  const isEnded = !isOngoing && !isUpcoming

  const remainingDays = Math.max(
    0,
    Math.ceil((appEvent.endAt * 1000 - now.getTime()) / DAY_MS),
  )

  const daysUntilStart = Math.max(
    0,
    Math.ceil((appEvent.startAt * 1000 - now.getTime()) / DAY_MS),
  )

  const startAt = useEventDateTimeText(appEvent.startAt)

  const endAt = useEventDateTimeText(appEvent.endAt)

  // 年月日だけにして一覧を読みやすくする（時刻は詳細ページで確認できる）
  const shortDate = (text: string) =>
    text.replace(/\s*\d{2}時\d{2}分$/, "").replace(/\s+\d{2}:\d{2}$/, "")

  const plainDescription = appEvent.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const statusLabel = isOngoing
    ? t("開催中", "Ongoing")
    : isUpcoming
      ? t("開催予定", "Upcoming")
      : t("終了", "Ended")

  const timingLabel = isOngoing
    ? remainingDays <= 1
      ? t("まもなく終了", "Ending soon")
      : t("あと{{count}}日", "{{count}} days left").replace(
          "{{count}}",
          remainingDays.toString(),
        )
    : isUpcoming
      ? t("{{count}}日後に開始", "Starts in {{count}} days").replace(
          "{{count}}",
          Math.max(1, daysUntilStart).toString(),
        )
      : null

  return (
    <Link
      className="group block h-full w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      to={`/events/${appEvent.slug}`}
    >
      <article
        className={`group-hover:-translate-y-0.5 flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 group-hover:shadow-md ${
          isEnded ? "opacity-80 group-hover:opacity-100" : ""
        }`}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={appEvent.thumbnailImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
            loading="lazy"
            decoding="async"
          />
          <img
            className={`relative h-full w-full object-contain transition duration-300 group-hover:scale-[1.03] ${
              isEnded ? "grayscale-[35%]" : ""
            }`}
            src={appEvent.thumbnailImageUrl}
            alt={appEvent.title}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 font-bold text-white text-xs shadow-sm ${
                isOngoing
                  ? "bg-rose-600"
                  : isUpcoming
                    ? "bg-sky-700"
                    : "bg-slate-600"
              }`}
            >
              {statusLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-medium text-xs shadow-sm ${
                appEvent.isOfficial
                  ? "bg-white/95 text-slate-900"
                  : "bg-violet-700 text-white"
              }`}
            >
              {appEvent.isOfficial
                ? t("公式", "Official")
                : t("ユーザー企画", "User event")}
            </span>
          </div>
          {timingLabel !== null && (
            <span className="absolute right-2 bottom-2 rounded-full bg-black/75 px-2.5 py-0.5 font-semibold text-white text-xs backdrop-blur-sm">
              {timingLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="line-clamp-2 font-bold text-sm leading-snug md:text-base">
            {appEvent.title}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {shortDate(startAt)} 〜 {shortDate(endAt)}
            </span>
          </div>
          {plainDescription.length > 0 && (
            <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
              {plainDescription}
            </p>
          )}
          {appEvent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs">
              {appEvent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="max-w-full truncate rounded-full bg-muted px-2 py-0.5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
            <div className="flex min-w-0 items-center gap-1.5 text-xs">
              <Avatar className="size-5">
                {appEvent.userIconUrl && (
                  <AvatarImage
                    src={withIconUrlFallback(appEvent.userIconUrl)}
                    alt=""
                  />
                )}
                <AvatarFallback className="text-[10px]">
                  {(appEvent.userName ?? "A").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {appEvent.userName ?? "Aipictors"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 text-muted-foreground text-xs">
              <span
                className="flex items-center gap-1"
                title={t("作品", "Entries")}
              >
                <ImageIcon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t("作品", "Entries")}</span>
                {appEvent.entryCount}
              </span>
              {!appEvent.isOfficial && (
                <span
                  className="flex items-center gap-1"
                  title={t("参加者", "Participants")}
                >
                  <Users className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">{t("参加者", "Participants")}</span>
                  {appEvent.participantCount}
                </span>
              )}
              {appEvent.rankingEnabled && (
                <span
                  className="flex items-center"
                  title={t("ランキングあり", "Ranking enabled")}
                >
                  <Trophy
                    className="size-3.5 text-amber-600"
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {t("ランキングあり", "Ranking enabled")}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
