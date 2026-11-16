import { CalendarDays, ImageIcon, Sparkles, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { useEventDateTimeText } from "~/routes/($lang).events._index/hooks/use-event-date-time-text"
import { toJstWallClockUnixSeconds } from "~/utils/jst-date"
import { getRenderNow } from "~/utils/render-now"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
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
  /** 参加者のアイコン（新しい全年齢作品の投稿者、最大 5 人） */
  participantIcons?: EventParticipantIcon[]
  /** R18 / R18G だけのイベント（全年齢の一覧ではカバー絵をぼかす） */
  isR18Only?: boolean
}

export type EventParticipantIcon = {
  id: string
  name?: string | null
  iconUrl?: string | null
}

/**
 * 重なった丸い参加者アイコンと「＋〇人」
 */
export function EventParticipantStack(props: {
  icons: EventParticipantIcon[]
  /** 参加者の総数（アイコンに出ない人数を「＋〇人」にする） */
  participantCount: number
  max: number
  size: "sm" | "md"
  /** 人数の単位（「人」） */
  unit?: string
  /** 人数のあとに付ける言葉（「が参加中」） */
  label?: string
}) {
  const icons = props.icons.slice(0, props.max)
  if (icons.length === 0) return null
  const rest = Math.max(0, props.participantCount - icons.length)
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span
        className={cn(
          "flex shrink-0",
          props.size === "md" ? "-space-x-2" : "-space-x-1.5",
        )}
      >
        {icons.map((icon) => (
          <img
            key={icon.id}
            src={withIconUrlFallback(toResizedImageUrl(icon.iconUrl, 96))}
            alt=""
            title={icon.name ?? undefined}
            loading="lazy"
            decoding="async"
            className={cn(
              "rounded-full border-2 border-card bg-muted object-cover",
              props.size === "md" ? "size-7" : "size-5",
            )}
          />
        ))}
      </span>
      {(rest > 0 || props.label) && (
        <span className="truncate font-bold text-xs tabular-nums">
          {rest > 0
            ? `＋${rest.toLocaleString()}${props.unit ?? ""}`
            : `${icons.length}${props.unit ?? ""}`}
          {props.label && (
            <span className="ml-0.5 font-normal text-muted-foreground">
              {props.label}
            </span>
          )}
        </span>
      )}
    </span>
  )
}

/**
 * 年齢区分が R18 / R18G だけのイベントか（全年齢・R15 の作品も受け付けるイベントは含めない）
 */
export const isR18OnlyEvent = (ratings: string[] | null | undefined) =>
  Array.isArray(ratings) &&
  ratings.length > 0 &&
  ratings.every((rating) => rating === "R18" || rating === "R18G")

/** R18 だけのイベントのカバー絵に重ねるぼかし */
export const R18_COVER_CLASS = "blur-xl scale-110"

export function R18CoverBadge() {
  return (
    <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 font-bold text-[10px] text-white">
      R18
    </span>
  )
}

type Props = {
  appEvent: EventCardItem
  /**
   * compact: 終了したイベントなど向けの小さめ表示（スマホでは横並び）
   * featured: 一覧の先頭の大きなカード（PC では画像と説明を横に並べる）
   */
  variant?: "default" | "compact" | "featured"
  /** 画面の最初に見えるカードは画像を先に読む */
  isEager?: boolean
}

const DAY_MS = 1000 * 60 * 60 * 24

export function AppEventCard(props: Props) {
  const appEvent = props.appEvent

  const t = useTranslation()

  // endAt / startAt は日本時間の壁時計を UTC として扱った値なので、いまも同じ形式にする。
  // hydration が終わるまではサーバーの描画時刻を使う（ずれると日数が食い違う）
  const nowMs = toJstWallClockUnixSeconds(new Date(getRenderNow())) * 1000

  const isOngoing = appEvent.status === "ONGOING"

  const isUpcoming = appEvent.status === "UPCOMING"

  const isEnded = !isOngoing && !isUpcoming

  const remainingDays = Math.max(
    0,
    Math.ceil((appEvent.endAt * 1000 - nowMs) / DAY_MS),
  )

  const daysUntilStart = Math.max(
    0,
    Math.ceil((appEvent.startAt * 1000 - nowMs) / DAY_MS),
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

  const participantIcons = appEvent.isOfficial
    ? []
    : (appEvent.participantIcons ?? [])

  // 締切が近い（残り3日以内）ものは目立たせる
  const isClosingSoon = isOngoing && remainingDays <= 3

  if (props.variant === "compact") {
    return (
      <Link
        className="group block h-full w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        to={`/events/${appEvent.slug}`}
      >
        <article className="flex h-full gap-3 overflow-hidden rounded-xl border bg-card p-2 transition duration-200 group-hover:bg-accent/50 sm:flex-col sm:gap-0 sm:p-0 sm:group-hover:shadow-md">
          <div className="relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-full sm:rounded-none">
            <img
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                isEnded ? "grayscale-[35%]" : ""
              } ${appEvent.isR18Only ? R18_COVER_CLASS : ""}`}
              src={toResizedImageUrl(appEvent.thumbnailImageUrl, 320)}
              alt={appEvent.title}
              loading="lazy"
              decoding="async"
            />
            {appEvent.isR18Only && <R18CoverBadge />}
            {isEnded && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-slate-700 px-2 py-0.5 font-bold text-[10px] text-white">
                {statusLabel}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 sm:p-2.5">
            <h3 className="line-clamp-2 font-bold text-sm leading-snug">
              {appEvent.title}
            </h3>
            <div className="truncate text-muted-foreground text-xs">
              {shortDate(startAt)} 〜 {shortDate(endAt)}
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground text-xs">
              {participantIcons.length > 0 ? (
                <EventParticipantStack
                  icons={participantIcons}
                  participantCount={appEvent.participantCount}
                  max={3}
                  size="sm"
                  unit={t("人", "")}
                />
              ) : (
                <span className="min-w-0 truncate">
                  {appEvent.userName ?? "Aipictors"}
                </span>
              )}
              <span
                className="ml-auto flex shrink-0 items-center gap-1"
                title={t("作品", "Entries")}
              >
                <ImageIcon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t("作品", "Entries")}</span>
                {appEvent.entryCount}
              </span>
              {appEvent.rankingEnabled && (
                <Trophy
                  className="size-3.5 shrink-0 text-amber-600"
                  aria-label={t("ランキングあり", "Ranking enabled")}
                />
              )}
            </div>
          </div>
        </article>
      </Link>
    )
  }

  const isFeatured = props.variant === "featured"

  // 残り日数は数字を大きく見せる（「あと 5 日」）
  const countdownNumber = isOngoing
    ? remainingDays
    : isUpcoming
      ? Math.max(1, daysUntilStart)
      : null

  return (
    <Link
      className="group block h-full w-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      to={`/events/${appEvent.slug}`}
    >
      <article
        className={cn(
          "group-hover:-translate-y-0.5 relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition duration-200 group-hover:shadow-lg motion-reduce:transition-none",
          isOngoing &&
            "border-rose-200 shadow-rose-100/60 dark:border-rose-900/70 dark:shadow-none",
          isEnded && "opacity-85 group-hover:opacity-100",
          isFeatured && "lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-muted lg:aspect-auto lg:min-h-full">
          <img
            src={toResizedImageUrl(appEvent.thumbnailImageUrl, 64)}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl",
              appEvent.isR18Only && R18_COVER_CLASS,
            )}
            loading="lazy"
            decoding="async"
          />
          <img
            className={cn(
              "relative h-full w-full object-contain transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none",
              !isFeatured && "lg:aspect-[16/9]",
              isEnded && "grayscale-[35%]",
              appEvent.isR18Only && R18_COVER_CLASS,
            )}
            src={toResizedImageUrl(
              appEvent.thumbnailImageUrl,
              isFeatured ? 960 : 480,
            )}
            srcSet={toResizedImageSrcSet(appEvent.thumbnailImageUrl, {
              minWidth: 320,
            })}
            sizes={
              isFeatured
                ? "(min-width: 1024px) 720px, 100vw"
                : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            }
            alt={appEvent.title}
            loading={props.isEager ? "eager" : "lazy"}
            fetchPriority={props.isEager ? "high" : undefined}
            decoding="async"
          />
          {appEvent.isR18Only && <R18CoverBadge />}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-white text-xs shadow-sm",
                isOngoing
                  ? "bg-rose-600"
                  : isUpcoming
                    ? "bg-sky-700"
                    : "bg-slate-600",
              )}
            >
              {isOngoing && (
                <span className="relative flex size-1.5" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
              )}
              {statusLabel}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 font-bold text-xs shadow-sm",
                appEvent.isOfficial
                  ? "bg-white/95 text-slate-900"
                  : "bg-violet-700 text-white",
              )}
            >
              {appEvent.isOfficial
                ? t("公式", "Official")
                : t("ユーザー企画", "User event")}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col gap-3 p-4",
            isFeatured && "lg:justify-center lg:gap-4 lg:p-7",
          )}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <h3
                className={cn(
                  "line-clamp-2 font-bold text-base leading-snug",
                  isFeatured && "md:text-xl lg:text-2xl",
                )}
              >
                {appEvent.title}
              </h3>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <CalendarDays
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {shortDate(startAt)} 〜 {shortDate(endAt)}
                </span>
              </div>
            </div>
            {countdownNumber !== null && (
              <div
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-2xl px-3 py-1.5 text-center leading-none",
                  isClosingSoon
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : isOngoing
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
                )}
              >
                <span className="font-bold text-[10px]">
                  {isOngoing ? t("のこり", "Left") : t("開始まで", "Starts in")}
                </span>
                {isOngoing && remainingDays <= 0 ? (
                  <span className="mt-1 font-black text-sm">
                    {t("今日まで", "Today")}
                  </span>
                ) : (
                  <span className="mt-0.5 font-black text-2xl tabular-nums">
                    {countdownNumber}
                    <span className="ml-0.5 font-bold text-[11px]">
                      {t("日", "d")}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
          {plainDescription.length > 0 && (
            <p
              className={cn(
                "line-clamp-2 text-muted-foreground text-xs leading-relaxed",
                isFeatured && "lg:line-clamp-3 lg:text-sm",
              )}
            >
              {plainDescription}
            </p>
          )}
          {appEvent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {appEvent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="max-w-full truncate rounded-full bg-muted px-2.5 py-1 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {participantIcons.length > 0 && (
            <div className="mt-auto">
              <EventParticipantStack
                icons={participantIcons}
                participantCount={appEvent.participantCount}
                max={5}
                size="md"
                unit={t("人", "")}
                label={
                  isEnded ? t("が参加", "joined") : t("が参加中", "joining")
                }
              />
            </div>
          )}
          <div
            className={cn(
              "flex items-center justify-between gap-2 border-t pt-3",
              participantIcons.length === 0 && "mt-auto",
            )}
          >
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <Avatar className="size-6 border">
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
              <span className="truncate font-medium">
                {appEvent.userName ?? "Aipictors"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs">
              <span
                className="flex items-center gap-1"
                title={t("参加作品", "Entries")}
              >
                <ImageIcon
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="font-bold tabular-nums">
                  {appEvent.entryCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {t("作品", "works")}
                </span>
              </span>
              {!appEvent.isOfficial &&
                appEvent.participantCount > 0 &&
                participantIcons.length === 0 && (
                  <span
                    className="flex items-center gap-1"
                    title={t("参加者", "Participants")}
                  >
                    <Users
                      className="size-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="font-bold tabular-nums">
                      {appEvent.participantCount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      {t("人", "people")}
                    </span>
                  </span>
                )}
              {appEvent.rankingEnabled && (
                <span
                  className="flex items-center"
                  title={t("ランキングあり", "Ranking enabled")}
                >
                  <Trophy
                    className="size-3.5 text-amber-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {t("ランキングあり", "Ranking enabled")}
                  </span>
                </span>
              )}
            </div>
          </div>
          {isFeatured && !isEnded && (
            <span className="hidden h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-rose-500 via-fuchsia-500 to-violet-600 font-bold text-sm text-white shadow-md lg:flex">
              <Sparkles className="size-4" aria-hidden="true" />
              {isOngoing
                ? t("見に行く・参加する", "View & join")
                : t("詳しく見る", "See details")}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
