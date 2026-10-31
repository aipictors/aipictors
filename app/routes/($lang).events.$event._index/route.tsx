import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { format } from "date-fns"
import { graphql } from "gql.tada"
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ImageIcon,
  Pencil,
  PenLine,
  Share2,
  Trophy,
} from "lucide-react"
import React, { useContext, useEffect, useId } from "react"
import { toast } from "sonner"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { usePersistentState } from "~/hooks/use-persistent-state"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import {
  EventAwardWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-award-work-list"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import type { SortType } from "~/types/sort-type"
import { createMeta } from "~/utils/create-meta"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

const DEFAULT_WORK_ORDER_BY: IntrospectionEnum<"WorkOrderBy"> = "DATE_CREATED"

const DEFAULT_EVENT_WORK_RATINGS: IntrospectionEnum<"Rating">[] = [
  "G",
  "R15",
  "R18",
  "R18G",
]

type NormalizedEvent = {
  eventSource: "OFFICIAL" | "USER"
  id: string
  slug: string
  title: string
  description: string
  thumbnailImageUrl: string
  headerImageUrl: string
  startAt: number
  endAt: number
  mainTag: string
  tags: string[]
  status: string
  remainingDays: number
  worksCount: number
  participantCount: number
  rankingEnabled: boolean
  rankingType: string
  participationGuide: string
  announcementText: string
  ratings?: IntrospectionEnum<"Rating">[] | null
  isSensitive: boolean
  userId?: string | null
  userName?: string | null
  userIconUrl?: string | null
  works: any[]
  awardWorks: any[]
}

const URL_REGEXP = /(https?:\/\/[^\s<]+[^\s<.,:;!?()[\]{}"'])/g

const buildEventAnnouncementText = (props: {
  title: string
  tag: string
  startAt: number
  endAt: number
  slug: string
}) => {
  const startAt = new Date(props.startAt * 1000).toLocaleString("ja-JP")
  const endAt = new Date(props.endAt * 1000).toLocaleString("ja-JP")

  return `${props.title}\n開催期間: ${startAt}〜${endAt}\n参加タグ: #${props.tag}\n詳細: https://www.aipictors.com/events/${props.slug}`
}

const normalizeOfficialEvent = (event: any): NormalizedEvent => ({
  eventSource: "OFFICIAL",
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  mainTag: event.tag,
  tags: event.tag ? [event.tag] : [],
  status: event.status,
  remainingDays: event.remainingDays,
  worksCount: event.worksCount,
  participantCount: 0,
  rankingEnabled: Boolean(event.awardWorks?.length),
  rankingType: "LIKES",
  participationGuide: event.wayToJoin ?? "",
  announcementText: buildEventAnnouncementText({
    title: event.title,
    tag: event.tag,
    startAt: event.startAt,
    endAt: event.endAt,
    slug: event.slug,
  }),
  ratings: null,
  isSensitive: false,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
})

const normalizeUserEvent = (event: any): NormalizedEvent => ({
  eventSource: "USER",
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  headerImageUrl:
    event.headerImageUrl || event.thumbnailImageUrl || "/images/opepnepe.png",
  startAt: event.startAt,
  endAt: event.endAt,
  mainTag: event.mainTag,
  tags: event.tags,
  status: event.status,
  remainingDays: event.remainingDays,
  worksCount: event.entryCount,
  participantCount: event.participantCount,
  rankingEnabled: event.rankingEnabled,
  rankingType: event.rankingType ?? "LIKES",
  participationGuide: event.participationGuide ?? "",
  announcementText:
    event.announcementText ||
    buildEventAnnouncementText({
      title: event.title,
      tag: event.mainTag,
      startAt: event.startAt,
      endAt: event.endAt,
      slug: event.slug,
    }),
  ratings: event.ratings,
  isSensitive: event.isSensitive ?? false,
  userId: event.userId,
  userName: event.userName,
  userIconUrl: event.userIconUrl ?? null,
  works: event.works ?? [],
  awardWorks: event.awardWorks ?? [],
})

const getEventRatingBadgeText = (
  event: Pick<NormalizedEvent, "ratings" | "isSensitive">,
) => {
  if (event.ratings && event.ratings.length > 0) {
    return event.ratings.join(", ")
  }

  if (event.isSensitive) {
    return "R18"
  }

  return null
}

const getStatusBadgeClassName = (status: string) => {
  if (status === "ONGOING") {
    return "border-transparent bg-emerald-500 text-white"
  }

  if (status === "UPCOMING") {
    return "border-transparent bg-sky-500 text-white"
  }

  return "border-transparent bg-slate-500 text-white"
}

/**
 * 参加タグをコピーする（タグの表示はタグ検索に飛ぶので、付け忘れたときにコピーしづらかった）
 */
function EventTagCopyButton (props: { tag: string }) {
  const t = useTranslation()

  const [isCopied, setIsCopied] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.tag)
      setIsCopied(true)
      toast(t(`「${props.tag}」をコピーしました`, `Copied "${props.tag}"`))
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      toast(t("コピーに失敗しました", "Failed to copy"))
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={t(`「${props.tag}」をコピー`, `Copy "${props.tag}"`)}
      title={t("タグをコピー", "Copy tag")}
      className="flex size-8 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
    >
      {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  )
}

function EventActionShare(props: {
  slug: string
  title: string
  announcementText: string
}) {
  const t = useTranslation()

  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/events/${props.slug}`
      : `https://www.aipictors.com/events/${props.slug}`

  const onCopyAnnouncement = async () => {
    try {
      await navigator.clipboard.writeText(props.announcementText)
      toast(t("告知文をコピーしました", "Announcement text copied"))
    } catch {
      toast(
        t("告知文のコピーに失敗しました", "Failed to copy announcement text"),
      )
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Share2 className="size-4" />
          {t("共有", "Share")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("イベントを共有する", "Share event")}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {props.title}
            </p>
          </div>
          <div className="grid gap-2">
            <CopyWorkUrlButton currentUrl={currentUrl} />
            <XIntent
              text={props.announcementText}
              hashtags={["Aipictors"]}
              label={t("Xで告知する", "Announce on X")}
            />
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={onCopyAnnouncement}
            >
              <Copy className="size-4" />
              {t("告知文をコピー", "Copy announcement text")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * 長い説明は高さを抑えて「続きを読む」で開く
 */
function CollapsibleDescription(props: { html: string }) {
  const t = useTranslation()
  const ref = React.useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isOverflowing, setIsOverflowing] = React.useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null) return
    setIsOverflowing(element.scrollHeight > element.clientHeight + 8)
  }, [props.html])

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={ref}
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none leading-7",
            // HTML でない説明（改行区切りの文章）は改行をそのまま見せる
            !/<[a-z][\s\S]*>/i.test(props.html) && "whitespace-pre-line",
            !isExpanded && "max-h-56 overflow-hidden",
          )}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted event description HTML
          dangerouslySetInnerHTML={{ __html: props.html }}
        />
        {!isExpanded && isOverflowing && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
        )}
      </div>
      {isOverflowing && (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? t("閉じる", "Show less") : t("続きを読む", "Read more")}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </Button>
      )}
    </div>
  )
}

function EventFact(props: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/70">
        {props.icon}
      </div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs">{props.label}</div>
        <div className="font-medium text-sm leading-relaxed">
          {props.children}
        </div>
      </div>
    </div>
  )
}

function LinkifiedTextBlock(props: {
  text: string
  className?: string
  linkClassName?: string
}) {
  const lines = props.text.split("\n")

  return (
    <div className={props.className}>
      {lines.map((line, lineIndex) => {
        const parts = line.split(URL_REGEXP)

        return (
          <div key={`${lineIndex}-${line}`}>
            {parts.map((part, partIndex) => {
              if (!part) {
                return null
              }

              if (/^https?:\/\//.test(part)) {
                return (
                  <a
                    key={`${lineIndex}-${partIndex}-${part}`}
                    href={part}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={props.linkClassName}
                  >
                    {part}
                  </a>
                )
              }

              return (
                <React.Fragment key={`${lineIndex}-${partIndex}-${part}`}>
                  {part}
                </React.Fragment>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const formatEventDateTimeText = (
  time: number,
  t: ReturnType<typeof useTranslation>,
) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

const formatEventMonthDayText = (time: number) => {
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return format(japanTime, "MM/dd")
}

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URL(props.request.url).searchParams

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const orderBy = urlParams.get("WorkOrderby")
    ? (urlParams.get("WorkOrderby") as IntrospectionEnum<"WorkOrderBy">)
    : DEFAULT_WORK_ORDER_BY

  const sort = urlParams.get("worksOrderDeskAsc")
    ? (urlParams.get("worksOrderDeskAsc") as SortType)
    : "DESC"

  const rating = urlParams.get("rating") as IntrospectionEnum<"Rating"> | null

  const eventsResp = await loaderClient.query({
    query: eventDetailQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: rating ? [rating] : DEFAULT_EVENT_WORK_RATINGS,
        isNowCreatedAt: true,
        orderBy,
        sort,
      },
      isSensitive: true,
    },
  })

  const appEvent = eventsResp.data.appEvent
  const userEvent = eventsResp.data.userEvent

  if (appEvent === null && userEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    appEvent: appEvent
      ? normalizeOfficialEvent(appEvent)
      : normalizeUserEvent(userEvent),
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: "イベントが見つかりませんでした" }]
  }

  const appEvent = (data as { appEvent: NormalizedEvent }).appEvent

  const stripHtmlTags = (str: string) => {
    return str.replace(/<[^>]*>?/gm, "")
  }

  return createMeta(META.EVENTS_INDEX, {
    title: appEvent.title,
    description: stripHtmlTags(appEvent.description),
    url: appEvent.thumbnailImageUrl,
  })
}

export default function EventDetailPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const event = data.appEvent

  // 並び順などは URL を正とする（ページを開いただけで URL を書き換えない）
  const workType =
    (searchParams.get("workType") as IntrospectionEnum<"WorkType">) || null
  const workOrderBy =
    (searchParams.get("WorkOrderby") as IntrospectionEnum<"WorkOrderBy">) ||
    DEFAULT_WORK_ORDER_BY
  const worksOrderDeskAsc =
    (searchParams.get("worksOrderDeskAsc") as SortType) || "DESC"
  const rating =
    (searchParams.get("rating") as IntrospectionEnum<"Rating">) || null

  const updateWorkParams = (next: Record<string, string | null>) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(next)) {
          if (value === null) {
            params.delete(key)
          } else {
            params.set(key, value)
          }
        }
        // 条件を変えたら 1 ページ目から
        params.set("page", "0")
        return params
      },
      { preventScrollReset: true },
    )
  }

  const sortBy = (orderBy: IntrospectionEnum<"WorkOrderBy">) => () => {
    updateWorkParams({
      WorkOrderby: orderBy,
      worksOrderDeskAsc:
        workOrderBy === orderBy && worksOrderDeskAsc === "DESC"
          ? "ASC"
          : "DESC",
    })
  }

  const revealSwitchId = useId()

  const [revealSensitiveThumbnails, setRevealSensitiveThumbnails] =
    usePersistentState<boolean>("event-sensitive-thumbnails-revealed", false)

  const isOwner =
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    event.userId === authContext.userId

  const isEnded = event.status !== "ONGOING" && event.status !== "UPCOMING"

  const statusText =
    event.status === "ONGOING"
      ? t("開催中", "Ongoing")
      : event.status === "UPCOMING"
        ? t("開催予定", "Upcoming")
        : t("終了", "Ended")

  const eventTypeText =
    event.eventSource === "USER"
      ? t("ユーザー企画", "User event")
      : t("公式イベント", "Official event")

  const ratingBadgeText = getEventRatingBadgeText(event)

  // R18/R18G を含みうるとき（対象年齢の指定外でも付いている作品がある）だけモザイク切り替えを出す
  const canContainSensitiveWorks =
    !event.ratings ||
    event.ratings.length === 0 ||
    event.ratings.some((r) => r === "R18" || r === "R18G") ||
    event.works.some(
      (work: { rating?: string | null; isSensitive?: boolean | null }) =>
        work.isSensitive || work.rating === "R18" || work.rating === "R18G",
    )

  const heroImageUrl = event.headerImageUrl || event.thumbnailImageUrl

  const postUrl = `/new/image?event=${event.slug}&tag=${encodeURIComponent(event.mainTag)}`

  const countdown = (() => {
    if (event.status === "ONGOING") {
      return {
        main:
          event.remainingDays <= 0
            ? t("本日まで", "Ends today")
            : t("残り{{count}}日", "{{count}} days left").replace(
                "{{count}}",
                event.remainingDays.toString(),
              ),
        sub: t("{{date}} まで", "Until {{date}}").replace(
          "{{date}}",
          formatEventDateTimeText(event.endAt, t),
        ),
        isUrgent: event.remainingDays <= 3,
      }
    }
    if (event.status === "UPCOMING") {
      return {
        main: t("開催前", "Upcoming"),
        sub: t("{{date}} から", "From {{date}}").replace(
          "{{date}}",
          formatEventDateTimeText(event.startAt, t),
        ),
        isUrgent: false,
      }
    }
    return {
      main: t("終了しました", "This event has ended"),
      sub: t("{{date}} に終了", "Ended {{date}}").replace(
        "{{date}}",
        formatEventDateTimeText(event.endAt, t),
      ),
      isUrgent: false,
    }
  })()

  const hasRanking = event.rankingEnabled && event.awardWorks.length > 0

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-8 md:px-6 xl:px-8">
      {/* ヘッダー: 画像（文字入りの告知画像が多いので切らずに全体を見せる）＋ 要点と参加ボタン */}
      <section className="overflow-hidden rounded-3xl border bg-card shadow-xs">
        <div
          className={cn(
            "grid",
            heroImageUrl && "lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]",
          )}
        >
          {heroImageUrl && (
            <div className="relative aspect-video overflow-hidden bg-muted lg:aspect-auto lg:min-h-[400px]">
              <img
                src={heroImageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl"
              />
              <img
                src={heroImageUrl}
                alt={event.title}
                className="relative size-full object-contain"
                fetchPriority="high"
              />
            </div>
          )}

          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusBadgeClassName(event.status)}>
                  {statusText}
                </Badge>
                <Badge variant="outline">{eventTypeText}</Badge>
                {ratingBadgeText && (
                  <Badge
                    variant="secondary"
                    className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  >
                    {ratingBadgeText}
                  </Badge>
                )}
              </div>
              <h1 className="text-pretty font-bold text-2xl leading-tight md:text-3xl">
                {event.title}
              </h1>
              {event.eventSource === "USER" && event.userId && (
                <Link
                  to={`/users/${event.userId}`}
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                >
                  <Avatar className="size-7 border">
                    {event.userIconUrl && (
                      <AvatarImage
                        src={withIconUrlFallback(event.userIconUrl)}
                        alt=""
                      />
                    )}
                    <AvatarFallback>
                      {(event.userName ?? event.userId)
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground">
                    {t("主催", "Host")}
                  </span>
                  <span className="font-medium">
                    {event.userName ?? event.userId}
                  </span>
                </Link>
              )}
            </div>

            {/* 残り日数がいちばん大事なので大きく */}
            <div
              className={cn(
                "rounded-2xl border px-4 py-3",
                countdown.isUrgent
                  ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
                  : "bg-muted/40",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 font-bold text-xl",
                  countdown.isUrgent && "text-amber-700 dark:text-amber-300",
                )}
              >
                <Clock className="size-5" />
                {countdown.main}
              </div>
              <div className="mt-1 text-muted-foreground text-sm">
                {countdown.sub}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EventFact
                icon={<CalendarDays className="size-4" />}
                label={t("開催期間", "Period")}
              >
                {formatEventMonthDayText(event.startAt)} 〜{" "}
                {formatEventMonthDayText(event.endAt)}
              </EventFact>
              <EventFact
                icon={<ImageIcon className="size-4" />}
                label={t("参加作品", "Entries")}
              >
                {t("{{count}}作品", "{{count}} works").replace(
                  "{{count}}",
                  event.worksCount.toLocaleString(),
                )}
                {event.participantCount > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    /{" "}
                    {t("{{count}}人", "{{count}} people").replace(
                      "{{count}}",
                      event.participantCount.toLocaleString(),
                    )}
                  </span>
                )}
              </EventFact>
              {event.rankingEnabled && (
                <EventFact
                  icon={<Trophy className="size-4" />}
                  label={t("ランキング", "Ranking")}
                >
                  {event.rankingType === "LIKES"
                    ? t("いいね数で決定", "By likes")
                    : event.rankingType}
                </EventFact>
              )}
            </div>

            {event.tags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-xs">
                  {t(
                    "参加タグ（投稿時に付けてください）",
                    "Entry tags (add when posting)",
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center rounded-full bg-muted"
                    >
                      <Link
                        to={`/tags/${encodeURIComponent(tag)}`}
                        className="rounded-l-full py-1 pr-1 pl-3 font-medium text-sm transition-colors hover:bg-muted/70"
                      >
                        #{tag}
                      </Link>
                      <EventTagCopyButton tag={tag} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {!isEnded && (
                <Button asChild size="lg" className="flex-1 gap-2">
                  <Link to={postUrl}>
                    <PenLine className="size-4" />
                    {t("このイベントに投稿する", "Post to this event")}
                  </Link>
                </Button>
              )}
              {isEnded && hasRanking && (
                <Button asChild size="lg" className="flex-1 gap-2">
                  <a href="#event-ranking">
                    <Trophy className="size-4" />
                    {t("結果を見る", "See results")}
                  </a>
                </Button>
              )}
              <EventActionShare
                slug={event.slug}
                title={event.title}
                announcementText={event.announcementText}
              />
              {isOwner && event.eventSource === "USER" && (
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link to={`/events/${event.slug}/edit`}>
                    <Pencil className="size-4" />
                    {t("編集", "Edit")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 概要・参加方法: 一覧の前に置くが、長い文は畳む */}
      {(event.description || event.participationGuide) && (
        <section
          className={cn(
            "grid gap-4",
            event.description &&
              event.participationGuide &&
              "lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]",
          )}
        >
          {event.description && (
            <div className="space-y-3 rounded-3xl border bg-card p-5 md:p-6">
              <h2 className="font-semibold text-lg">
                {t("イベント概要", "About this event")}
              </h2>
              <CollapsibleDescription html={event.description} />
            </div>
          )}
          {event.participationGuide && (
            <div className="space-y-3 rounded-3xl border bg-card p-5 md:p-6">
              <h2 className="font-semibold text-lg">
                {t("参加方法", "How to join")}
              </h2>
              <LinkifiedTextBlock
                text={event.participationGuide}
                className="text-sm leading-7"
                linkClassName="break-all font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700"
              />
            </div>
          )}
        </section>
      )}

      {hasRanking && (
        <div
          id="event-ranking"
          className="scroll-mt-20 rounded-3xl border bg-card p-5 md:p-6"
        >
          <EventAwardWorkList
            works={event.awardWorks}
            slug={event.slug}
            eventSource={event.eventSource}
            revealSensitiveThumbnails={revealSensitiveThumbnails}
          />
        </div>
      )}

      <section
        id="event-works"
        className="scroll-mt-20 space-y-4 rounded-3xl border bg-card p-4 md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-semibold text-xl md:text-2xl">
            {t("参加作品", "Entries")}
            <span className="ml-2 font-normal text-base text-muted-foreground">
              {t("{{count}}件", "{{count}}").replace(
                "{{count}}",
                event.worksCount.toLocaleString(),
              )}
            </span>
          </h2>
          {event.slug && (
            <SensitiveToggle
              variant="compact"
              targetUrl={`/r/events/${event.slug}`}
            />
          )}
        </div>

        {event.works.length === 0 && data.page === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {isEnded
                ? t("参加作品はありませんでした", "There were no entries")
                : t(
                    "まだ参加作品がありません。最初の1作品を投稿してみませんか？",
                    "No entries yet. Be the first to post!",
                  )}
            </p>
            {!isEnded && (
              <Button asChild>
                <Link to={postUrl}>
                  {t("このイベントに投稿する", "Post to this event")}
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <EventWorkList
            works={event.works}
            maxCount={event.worksCount}
            page={data.page}
            slug={event.slug}
            eventSource={event.eventSource}
            sort={worksOrderDeskAsc}
            orderBy={workOrderBy}
            workType={workType}
            rating={rating}
            sumWorksCount={event.worksCount}
            sortVariant="chips"
            onChangeOrderBy={(orderBy) =>
              updateWorkParams({
                WorkOrderby: orderBy,
                worksOrderDeskAsc: "DESC",
              })
            }
            toolbarEnd={
              canContainSensitiveWorks ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    id={revealSwitchId}
                    checked={revealSensitiveThumbnails}
                    onCheckedChange={setRevealSensitiveThumbnails}
                  />
                  <Label
                    htmlFor={revealSwitchId}
                    className="cursor-pointer font-normal text-muted-foreground"
                  >
                    {t("R18のモザイクを外す", "Unblur R18")}
                  </Label>
                </div>
              ) : undefined
            }
            setWorkType={(value) => updateWorkParams({ workType: value })}
            setRating={(value) => updateWorkParams({ rating: value })}
            setSort={(value) => updateWorkParams({ worksOrderDeskAsc: value })}
            onClickTitleSortButton={sortBy("NAME")}
            onClickLikeSortButton={sortBy("LIKES_COUNT")}
            onClickBookmarkSortButton={sortBy("BOOKMARKS_COUNT")}
            onClickCommentSortButton={sortBy("COMMENTS_COUNT")}
            onClickViewSortButton={sortBy("VIEWS_COUNT")}
            onClickAccessTypeSortButton={sortBy("ACCESS_TYPE")}
            onClickDateSortButton={sortBy("DATE_CREATED")}
            onClickWorkTypeSortButton={sortBy("WORK_TYPE")}
            onClickIsPromotionSortButton={sortBy("IS_PROMOTION")}
            revealSensitiveThumbnails={revealSensitiveThumbnails}
          />
        )}
      </section>

      {/* 一覧を見終わったあとにも参加ボタン */}
      {!isEnded && event.works.length > 0 && (
        <section className="flex flex-col items-center gap-3 rounded-3xl border bg-card px-5 py-8 text-center">
          <p className="font-semibold text-lg">
            {t("あなたも参加してみませんか？", "Want to join in?")}
          </p>
          {event.mainTag && (
            <p className="text-muted-foreground text-sm">
              {t(
                "投稿時にタグ「#{{tag}}」を付けると参加できます",
                "Add the tag #{{tag}} when posting to join",
              ).replace("{{tag}}", event.mainTag)}
            </p>
          )}
          <Button asChild size="lg" className="gap-2">
            <Link to={postUrl}>
              <PenLine className="size-4" />
              {t("このイベントに投稿する", "Post to this event")}
            </Link>
          </Button>
        </section>
      )}
    </div>
  )
}

const eventDetailQuery = graphql(
  `query EventDetail($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!, $isSensitive: Boolean!) {
    appEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
      worksCount
      wayToJoin
      status
      remainingDays
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
    userEvent(slug: $slug) {
      id
      title
      slug
      description
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      mainTag
      tags
      status
      remainingDays
      entryCount
      participantCount
      rankingEnabled
      rankingType
      participationGuide
      announcementText
      ratings
      isSensitive
      userId
      userName
      userIconUrl
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventWorkListItemFragment, EventAwardWorkListItemFragment],
)
