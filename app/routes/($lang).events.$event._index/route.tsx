import { toSafeUserEventDescriptionHtml } from "~/utils/user-event-description-html"
import { isR18Work } from "~/lib/is-r18-work"
import { UserEventReportDialog } from "~/routes/($lang).events.$event._index/components/user-event-report-dialog"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { format } from "date-fns"
import { graphql } from "gql.tada"
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Heart,
  ListChecks,
  Pencil,
  PenLine,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react"
import React, { useContext, useEffect, useId } from "react"
import { toast } from "sonner"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
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
import { toJstDisplayDate } from "~/utils/to-jst-display-date"
import type { Thing, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { appPillTabClassName } from "~/components/app/app-pill-tab"
import {
  isMedalRank,
  RANK_MEDAL_STYLES,
  RankCrown,
  RankMedalBadge,
} from "~/components/ranking/ranking-medal"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

const DEFAULT_WORK_ORDER_BY: IntrospectionEnum<"WorkOrderBy"> = "DATE_CREATED"

const DEFAULT_EVENT_WORK_RATINGS: IntrospectionEnum<"Rating">[] = [
  "G",
  "R15",
  "R18",
  "R18G",
]

/** R18 版（/r/events/…）で出す作品の区分 */
const SENSITIVE_EVENT_WORK_RATINGS: IntrospectionEnum<"Rating">[] = [
  "R18",
  "R18G",
]

/** R18 版のイベントページか（/r/events/… も同じ画面で、作品だけ R18・R18G にする） */
const isSensitiveEventPath = (pathname: string) =>
  /^(\/en)?\/r\/events\//.test(pathname)

type NormalizedEvent = {
  /** 公式が主催する枠（ピックアップモデルのお題など） */
  isOfficial?: boolean
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
  isOfficial: event.isOfficial === true,
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: toSafeUserEventDescriptionHtml(event.description),
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
function EventTagCopyButton(props: { tag: string }) {
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
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
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

// startAt / endAt は日本時間の壁時計を UTC として扱った秒。
// toJstDisplayDate でサーバー（UTC）とブラウザ（JST）のどちらでも同じ文字にする（食い違うと #418）
const toEventDisplayDate = (time: number) =>
  toJstDisplayDate((time - 9 * 60 * 60) * 1000)

const formatEventDateTimeText = (
  time: number,
  t: ReturnType<typeof useTranslation>,
) => {
  const japanTime = toEventDisplayDate(time)

  return t(
    format(japanTime, "yyyy年M月d日 HH:mm"),
    format(japanTime, "MMM d, yyyy HH:mm"),
  )
}

const formatEventYmdText = (time: number) =>
  format(toEventDisplayDate(time), "yyyy/M/d")

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const url = new URL(props.request.url)

  const urlParams = url.searchParams

  const isSensitivePage = isSensitiveEventPath(url.pathname)

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

  const ratingParam = urlParams.get(
    "rating",
  ) as IntrospectionEnum<"Rating"> | null

  const defaultRatings = isSensitivePage
    ? SENSITIVE_EVENT_WORK_RATINGS
    : DEFAULT_EVENT_WORK_RATINGS

  const rating =
    ratingParam && defaultRatings.includes(ratingParam) ? ratingParam : null

  const eventsResp = await loaderClient.query({
    query: eventDetailQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: rating ? [rating] : defaultRatings,
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
    isSensitivePage,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  if (!data) {
    return [{ title: "イベントが見つかりませんでした" }]
  }

  const appEvent = data.appEvent as NormalizedEvent

  const plainDescription = toPlainText(appEvent.description)

  const period = `${formatEventYmdText(appEvent.startAt)}〜${formatEventYmdText(appEvent.endAt)}`

  const statusText =
    appEvent.status === "ONGOING"
      ? "開催中"
      : appEvent.status === "UPCOMING"
        ? "開催予定"
        : "終了"

  const tagText = appEvent.mainTag ? `参加タグ #${appEvent.mainTag}。` : ""

  const meta = createMeta(
    META.EVENTS_INDEX,
    {
      title: `${appEvent.title}（${statusText}・${period}）AIイラストイベント`,
      enTitle: `${appEvent.title} (${period}) - AI art event`,
      description: `【${statusText}】${period}開催のAIイラストイベント「${appEvent.title}」。${tagText}参加作品${appEvent.worksCount.toLocaleString()}件。${plainDescription}`,
      enDescription: `AI art event "${appEvent.title}" (${period}). ${appEvent.worksCount.toLocaleString()} entries. ${plainDescription}`,
      url: appEvent.thumbnailImageUrl || config.defaultOgpImageUrl,
    },
    params.lang,
  )

  return [
    ...meta,
    { property: "og:image:alt", content: appEvent.title },
    { name: "twitter:image:alt", content: appEvent.title },
  ]
}

/** HTML の説明を 1 行の文に（meta・構造化データ用） */
const toPlainText = (html: string) =>
  html
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()

/** 日本時間の壁時計を UTC として扱った秒 → ISO 8601（+09:00） */
const toJstIsoString = (time: number) =>
  new Date(time * 1000).toISOString().replace(/\.\d{3}Z$/, "+09:00")

type EventWork = {
  id: string
  title?: string | null
  enTitle?: string | null
  smallThumbnailImageURL?: string | null
  largeThumbnailImageURL?: string | null
  likesCount?: number | null
  rating?: string | null
  isSensitive?: boolean | null
  user?: {
    id: string
    name?: string | null
    login?: string | null
    iconUrl?: string | null
  } | null
}

/**
 * 構造化データ（Event・参加作品の ItemList・パンくず）
 */
const createEventJsonLd = (props: {
  event: NormalizedEvent
  lang?: string
}): Array<WithContext<Thing>> => {
  const event = props.event
  const prefix = props.lang === "en" ? "/en" : ""
  const pageUrl = `${config.siteURL}${prefix}/events/${event.slug}`
  const works = (event.works as EventWork[]).filter(
    (work) => work.rating !== "R18" && work.rating !== "R18G",
  )
  const description = toPlainText(event.description).slice(0, 300)
  const images = [event.headerImageUrl, event.thumbnailImageUrl].filter(
    (url, index, list): url is string =>
      typeof url === "string" &&
      url.startsWith("http") &&
      list.indexOf(url) === index,
  )

  const organizer =
    event.eventSource === "USER" && !event.isOfficial && event.userId
      ? {
          "@type": "Person" as const,
          name: event.userName ?? event.userId,
          url: `${config.siteURL}${prefix}/users/${event.userId}`,
        }
      : {
          "@type": "Organization" as const,
          name: "Aipictors",
          url: `${config.siteURL}${prefix || "/"}`,
        }

  return [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      ...(description.length > 0 && { description }),
      url: pageUrl,
      startDate: toJstIsoString(event.startAt),
      endDate: toJstIsoString(event.endAt),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      location: {
        "@type": "VirtualLocation",
        url: pageUrl,
      },
      ...(images.length > 0 && { image: images }),
      organizer,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        url: pageUrl,
        price: 0,
        priceCurrency: "JPY",
        availability:
          event.status === "ENDED"
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
        validFrom: toJstIsoString(event.startAt),
      },
      ...(event.mainTag && { keywords: event.tags.join(", ") }),
    },
    ...(works.length > 0
      ? [
          {
            "@context": "https://schema.org" as const,
            "@type": "ItemList" as const,
            name: `${event.title} の参加作品`,
            numberOfItems: event.worksCount,
            itemListElement: works.slice(0, 20).map((work, index) => ({
              "@type": "ListItem" as const,
              position: index + 1,
              url: `${config.siteURL}${prefix}/posts/${work.id}`,
              name: work.title || `${event.title} #${index + 1}`,
              ...(work.smallThumbnailImageURL && {
                image: work.smallThumbnailImageURL,
              }),
            })),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Aipictors",
          item: `${config.siteURL}${prefix || "/"}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: props.lang === "en" ? "Events" : "イベント・企画",
          item: `${config.siteURL}${prefix}/events`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: event.title,
          item: pageUrl,
        },
      ],
    },
  ]
}

export default function EventDetailPage() {
  const t = useTranslation()
  const params = useParams()
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

  const isSensitivePage = data.isSensitivePage

  const [revealSensitiveThumbnails, setRevealSensitiveThumbnails] =
    usePersistentState<boolean>("event-sensitive-thumbnails-revealed", false)

  const isOwner =
    authContext.userId !== null &&
    authContext.userId !== undefined &&
    event.userId === authContext.userId

  const isEnded = event.status !== "ONGOING" && event.status !== "UPCOMING"

  const isOngoing = event.status === "ONGOING"

  const statusText =
    event.status === "ONGOING"
      ? t("開催中", "Ongoing")
      : event.status === "UPCOMING"
        ? t("開催予定", "Upcoming")
        : event.status === "HIDDEN"
          ? t("運営により非表示", "Hidden by moderators")
          : t("終了", "Ended")

  const eventTypeText =
    event.eventSource === "USER" && !event.isOfficial
      ? t("ユーザー企画", "User event")
      : t("公式", "Official")

  const ratingBadgeText = getEventRatingBadgeText(event)

  // R18/R18G を含みうるとき（対象年齢の指定外でも付いている作品がある）だけモザイク切り替えを出す
  const canContainSensitiveWorks =
    !isSensitivePage &&
    (!event.ratings ||
      event.ratings.length === 0 ||
      event.ratings.some((r) => r === "R18" || r === "R18G") ||
      event.works.some(
        (work: { rating?: string | null; isSensitive?: boolean | null }) =>
          isR18Work(work),
      ))

  const heroImageUrl = event.headerImageUrl || event.thumbnailImageUrl

  const postUrl = `/new/image?event=${event.slug}&tag=${encodeURIComponent(event.mainTag)}`

  const works = event.works as EventWork[]

  // 参加者のアイコン（いま読み込んだ作品の投稿者。新しい問い合わせはしない）
  const participants = works.reduce<NonNullable<EventWork["user"]>[]>(
    (list, work) => {
      if (work.user && !list.some((user) => user.id === work.user?.id)) {
        list.push(work.user)
      }
      return list
    },
    [],
  )

  // 作品がこのページに全部載っているときは数えた人数が正確
  const participantCount =
    event.participantCount > 0
      ? event.participantCount
      : event.worksCount <= works.length
        ? participants.length
        : 0

  // 自分の参加作品（ログイン後にわかる。サーバーの描画では出さない）
  const myWorks =
    authContext.userId !== null && authContext.userId !== undefined
      ? works.filter((work) => work.user?.id === authContext.userId)
      : []

  const hasJoined = myWorks.length > 0

  const hasRanking = event.rankingEnabled && event.awardWorks.length > 0

  // 入賞がまだ無いとき、参加作品がこのページに全部あるならいいねの多い 3 作品に冠を付ける
  const topLikedWorks =
    !hasRanking && data.page === 0 && event.worksCount <= works.length
      ? [...works]
          .filter(
            (work) =>
              (work.likesCount ?? 0) > 0 &&
              work.rating !== "R18" &&
              work.rating !== "R18G",
          )
          .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
          .slice(0, 3)
      : []

  const pageUrl = `${config.siteURL}${params.lang === "en" ? "/en" : ""}/events/${event.slug}`

  const shareText = hasJoined
    ? t("「{{title}}」に参加しました！{{tag}}", 'I joined "{{title}}"! {{tag}}')
        .replace("{{title}}", event.title)
        .replace("{{tag}}", event.mainTag ? ` #${event.mainTag}` : "")
    : isEnded
      ? t(
          "「{{title}}」の参加作品を見る",
          'See the entries of "{{title}}"',
        ).replace("{{title}}", event.title)
      : t(
          "AIイラスト企画「{{title}}」開催中！{{tag}} を付けて投稿すると参加できます",
          'AI art event "{{title}}" is on! Post with {{tag}} to join',
        )
          .replace("{{title}}", event.title)
          .replace("{{tag}}", event.mainTag ? `#${event.mainTag}` : "")

  const xShareUrl = `https://x.com/intent/tweet?${new URLSearchParams({
    text: shareText,
    url: pageUrl,
    hashtags: "Aipictors",
  }).toString()}`

  const countdown = (() => {
    if (event.status === "ONGOING") {
      return {
        label: t("締切まで", "Ends in"),
        number: event.remainingDays > 0 ? event.remainingDays : null,
        today: t("今日まで", "Ends today"),
        sub: t("{{date}} まで", "Until {{date}}").replace(
          "{{date}}",
          formatEventDateTimeText(event.endAt, t),
        ),
        isUrgent: event.remainingDays <= 3,
      }
    }
    if (event.status === "UPCOMING") {
      return {
        label: t("開始", "Starts"),
        number: null,
        today: t("もうすぐ", "Soon"),
        sub: t("{{date}} から", "From {{date}}").replace(
          "{{date}}",
          formatEventDateTimeText(event.startAt, t),
        ),
        isUrgent: false,
      }
    }
    return {
      label: t("結果", "Result"),
      number: null,
      today: t("終了しました", "Ended"),
      sub: t("{{date}} に終了", "Ended {{date}}").replace(
        "{{date}}",
        formatEventDateTimeText(event.endAt, t),
      ),
      isUrgent: false,
    }
  })()

  const workSortTabs: Array<{
    orderBy: IntrospectionEnum<"WorkOrderBy">
    label: string
  }> = [
    { orderBy: "DATE_CREATED", label: t("新着", "Newest") },
    { orderBy: "LIKES_COUNT", label: t("人気", "Popular") },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 pb-8 md:gap-6 md:px-6 xl:px-8">
      <AppJsonLdScript
        jsonLd={createEventJsonLd({ event, lang: params.lang })}
      />
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to="/" className="shrink-0 hover:text-foreground hover:underline">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <Link
          to="/events"
          className="shrink-0 hover:text-foreground hover:underline"
        >
          {t("イベント・企画", "Events")}
        </Link>
        <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
        <span aria-current="page" className="truncate text-foreground">
          {event.title}
        </span>
      </nav>

      {/* ヒーロー: 告知画像（文字入りが多いので切らない）＋ 残り日数・参加ボタン */}
      <section className="relative overflow-hidden rounded-3xl border bg-zinc-950 text-white shadow-lg">
        {heroImageUrl && (
          <img
            src={heroImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />
        <div
          className={cn(
            "relative grid",
            heroImageUrl && "lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]",
          )}
        >
          {heroImageUrl && (
            <div className="relative aspect-video lg:aspect-auto lg:min-h-[440px]">
              <img
                src={heroImageUrl}
                alt={event.title}
                className="absolute inset-0 size-full object-contain p-0 lg:p-5"
                fetchPriority="high"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs",
                  getStatusBadgeClassName(event.status),
                )}
              >
                {isOngoing && (
                  <span className="relative flex size-1.5" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                )}
                {statusText}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-bold text-xs backdrop-blur-sm">
                {eventTypeText}
              </span>
              {ratingBadgeText && (
                <span className="rounded-full bg-rose-500/90 px-3 py-1 font-bold text-xs">
                  {ratingBadgeText}
                </span>
              )}
              {hasJoined && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 font-bold text-xs shadow-md">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  {t("参加済み", "Joined")}
                </span>
              )}
            </div>
            <h1 className="text-pretty font-black text-2xl leading-tight tracking-tight md:text-4xl">
              {event.title}
            </h1>
            {event.eventSource === "USER" && event.userId && (
              <Link
                to={`/users/${event.userId}`}
                className="inline-flex w-fit items-center gap-2 text-sm hover:underline"
              >
                <Avatar className="size-7 border border-white/40">
                  {event.userIconUrl && (
                    <AvatarImage
                      src={toIconImageUrl(event.userIconUrl)}
                      alt=""
                    />
                  )}
                  <AvatarFallback className="text-foreground">
                    {(event.userName ?? event.userId).slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white/70">{t("主催", "Host")}</span>
                <span className="font-bold">
                  {event.userName ?? event.userId}
                </span>
              </Link>
            )}

            {/* 残り日数・作品数・参加者数 */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={cn(
                  "col-span-1 flex flex-col justify-center rounded-2xl px-3 py-2.5",
                  countdown.isUrgent
                    ? "bg-amber-400 text-amber-950"
                    : "bg-white/15 backdrop-blur-sm",
                )}
              >
                <span className="font-bold text-[11px] opacity-80">
                  {countdown.label}
                </span>
                {countdown.number !== null ? (
                  <span className="font-black text-3xl tabular-nums leading-tight">
                    {countdown.number}
                    <span className="ml-0.5 font-bold text-sm">
                      {t("日", "d")}
                    </span>
                  </span>
                ) : (
                  <span className="font-black text-lg leading-tight">
                    {countdown.today}
                  </span>
                )}
              </div>
              <div className="flex flex-col justify-center rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <span className="font-bold text-[11px] opacity-80">
                  {t("参加作品", "Entries")}
                </span>
                <span className="font-black text-3xl tabular-nums leading-tight">
                  {event.worksCount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col justify-center rounded-2xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <span className="font-bold text-[11px] opacity-80">
                  {t("参加者", "Creators")}
                </span>
                <span className="font-black text-3xl tabular-nums leading-tight">
                  {participantCount > 0
                    ? participantCount.toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-white/80">
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              {formatEventDateTimeText(event.startAt, t)} 〜{" "}
              {formatEventDateTimeText(event.endAt, t)}
            </p>

            {participants.length > 0 && (
              <a
                href="#event-works"
                className="flex w-fit items-center gap-3 rounded-full bg-white/10 py-1.5 pr-4 pl-1.5 backdrop-blur-sm transition hover:bg-white/20"
              >
                <span className="-space-x-2 flex">
                  {participants.slice(0, 7).map((user) => (
                    <Avatar
                      key={user.id}
                      className="size-8 border-2 border-zinc-900"
                    >
                      <AvatarImage src={toIconImageUrl(user.iconUrl)} alt="" />
                      <AvatarFallback className="text-[10px] text-foreground">
                        {(user.name ?? "?").slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
                <span className="font-bold text-sm">
                  {participantCount > 0
                    ? (isEnded
                        ? t("{{count}}人が参加", "{{count}} joined")
                        : t("{{count}}人が参加中", "{{count}} joining")
                      ).replace("{{count}}", participantCount.toLocaleString())
                    : t("みんなが参加中", "People are joining")}
                </span>
              </a>
            )}

            {event.tags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-white/70 text-xs">
                  {t(
                    "参加タグ（投稿時に付けると参加できます）",
                    "Entry tags (add when posting to join)",
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center rounded-full bg-white text-zinc-900"
                    >
                      <Link
                        to={`/tags/${encodeURIComponent(tag)}`}
                        className="rounded-l-full py-1.5 pr-1 pl-3.5 font-bold text-sm"
                      >
                        #{tag}
                      </Link>
                      <EventTagCopyButton tag={tag} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-1">
              {!isEnded && (
                <Link
                  to={postUrl}
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-linear-to-r from-rose-500 via-fuchsia-500 to-violet-600 whitespace-nowrap px-4 font-black text-[15px] text-white sm:text-base shadow-[0_10px_30px_-8px_rgba(217,70,239,0.7)] transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
                >
                  <PenLine className="size-5" aria-hidden="true" />
                  {hasJoined
                    ? t("もう1作品投稿する", "Post another entry")
                    : t(
                        "このイベントに参加する（投稿する）",
                        "Join this event (post)",
                      )}
                </Link>
              )}
              {isEnded && hasRanking && (
                <a
                  href="#event-ranking"
                  className="flex h-14 items-center justify-center gap-2 rounded-full bg-linear-to-r from-amber-400 to-orange-500 px-6 font-black text-base text-white shadow-md"
                >
                  <Trophy className="size-5" aria-hidden="true" />
                  {t("結果を見る", "See results")}
                </a>
              )}
              <div className="flex flex-wrap gap-2">
                <a
                  href={xShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 font-bold text-sm text-white ring-1 ring-white/25 transition hover:bg-zinc-800"
                >
                  <XLogo className="size-4" />
                  {hasJoined
                    ? t("参加をXで報告", "Share on X")
                    : t("Xでシェア", "Share on X")}
                </a>
                <EventActionShare
                  slug={event.slug}
                  title={event.title}
                  announcementText={event.announcementText}
                />
                {isOwner && event.eventSource === "USER" && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 gap-2 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link to={`/events/${event.slug}/edit`}>
                      <Pencil className="size-4" />
                      {t("編集", "Edit")}
                    </Link>
                  </Button>
                )}
                {!isOwner &&
                  event.eventSource === "USER" &&
                  authContext.isLoggedIn && (
                    <UserEventReportDialog eventId={String(event.id)} />
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 自分の参加作品（承認欲求: 自分の絵がイベントに並んでいるのを見せる） */}
      {hasJoined && (
        <section className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 md:p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold text-base md:text-lg">
              <BadgeCheck
                className="size-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              {t("あなたの参加作品", "Your entries")}
              <span className="font-normal text-muted-foreground text-sm">
                {myWorks.length}
              </span>
            </h2>
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-full bg-black px-4 font-bold text-white text-xs"
            >
              <XLogo className="size-3.5" />
              {t("参加をXで報告", "Share on X")}
            </a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {myWorks.map((work) => (
              <Link
                key={work.id}
                to={`/posts/${work.id}`}
                className="w-28 shrink-0 space-y-1 sm:w-36"
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-muted ring-2 ring-emerald-400">
                  {work.smallThumbnailImageURL && (
                    <img
                      src={work.smallThumbnailImageURL}
                      alt={work.title ?? ""}
                      className={cn(
                        "size-full object-cover",
                        !revealSensitiveThumbnails &&
                          isR18Work(work) &&
                          "blur-xl",
                      )}
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="truncate font-bold text-xs">
                  {t.workTitle(work.title ?? "", work.enTitle ?? "")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 概要・参加方法・ランキング: 区切って読みやすく */}
      {(event.description ||
        event.participationGuide ||
        event.rankingEnabled) && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
          {event.description ? (
            <section className="space-y-3 rounded-3xl border bg-card p-5 md:p-6">
              <h2 className="flex items-center gap-2 font-bold text-lg">
                <span className="flex size-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <BookOpen className="size-4" aria-hidden="true" />
                </span>
                {t("イベント概要", "About this event")}
              </h2>
              <CollapsibleDescription html={event.description} />
            </section>
          ) : (
            <div className="hidden lg:block" />
          )}
          <div className="flex flex-col gap-4">
            {event.participationGuide && (
              <section className="space-y-3 rounded-3xl border bg-card p-5 md:p-6">
                <h2 className="flex items-center gap-2 font-bold text-lg">
                  <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <ListChecks className="size-4" aria-hidden="true" />
                  </span>
                  {t("参加方法・ルール", "How to join & rules")}
                </h2>
                <LinkifiedTextBlock
                  text={event.participationGuide}
                  className="text-sm leading-7"
                  linkClassName="break-all font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700"
                />
              </section>
            )}
            {event.rankingEnabled && (
              <section className="space-y-2 rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-5 md:p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-orange-950/30">
                <h2 className="flex items-center gap-2 font-bold text-lg">
                  <span className="flex size-8 items-center justify-center rounded-full bg-amber-400 text-white">
                    <Trophy className="size-4" aria-hidden="true" />
                  </span>
                  {t("ランキング・入賞", "Ranking & awards")}
                </h2>
                <p className="text-sm leading-7">
                  {event.rankingType === "LIKES"
                    ? t(
                        "いいねが多い作品が上位になります。上位の作品はこのページで王冠付きで紹介されます。",
                        "Works with the most likes rank highest, shown with crowns on this page.",
                      )
                    : t(
                        "上位の作品はこのページで王冠付きで紹介されます。",
                        "Top works are shown with crowns on this page.",
                      )}
                </p>
              </section>
            )}
            {!event.participationGuide && event.mainTag && (
              <section className="space-y-2 rounded-3xl border bg-card p-5 md:p-6">
                <h2 className="flex items-center gap-2 font-bold text-lg">
                  <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <ListChecks className="size-4" aria-hidden="true" />
                  </span>
                  {t("参加方法", "How to join")}
                </h2>
                <p className="text-sm leading-7">
                  {t(
                    "投稿するときにタグ「#{{tag}}」を付けるだけで参加できます。",
                    "Just add the tag #{{tag}} when you post.",
                  ).replace("{{tag}}", event.mainTag)}
                </p>
              </section>
            )}
          </div>
        </div>
      )}

      {hasRanking && (
        <div
          id="event-ranking"
          className="scroll-mt-20 rounded-3xl border border-amber-200 bg-linear-to-b from-amber-50/80 to-card p-4 md:p-6 dark:border-amber-900/60 dark:from-amber-950/30"
        >
          <EventAwardWorkList
            works={event.awardWorks}
            slug={event.slug}
            eventSource={event.eventSource}
            revealSensitiveThumbnails={
              isSensitivePage || revealSensitiveThumbnails
            }
          />
        </div>
      )}

      {topLikedWorks.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-amber-200 bg-linear-to-b from-amber-50/80 to-card p-4 md:p-6 dark:border-amber-900/60 dark:from-amber-950/30">
          <h2 className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <Crown
              className="size-5 fill-[#F5C542] text-[#C98A0C]"
              aria-hidden="true"
            />
            {t("いいねが多い参加作品", "Most liked entries")}
          </h2>
          <ol className="grid grid-cols-3 items-end gap-2 md:gap-4">
            {[1, 0, 2].map((index) => {
              const work = topLikedWorks[index]
              if (!work) return <li key={index} />
              const rank = index + 1
              return (
                <li
                  key={work.id}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1.5",
                    rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3",
                  )}
                >
                  <RankCrown
                    rank={rank}
                    className={rank === 1 ? "size-8" : "size-6"}
                  />
                  <Link
                    to={`/posts/${work.id}`}
                    className={cn(
                      "relative block w-full overflow-hidden rounded-2xl bg-muted ring-4",
                      isMedalRank(rank) && RANK_MEDAL_STYLES[rank].ring,
                      isMedalRank(rank) && RANK_MEDAL_STYLES[rank].glow,
                      rank === 1 ? "aspect-[3/4]" : "aspect-square",
                    )}
                  >
                    {work.smallThumbnailImageURL && (
                      <img
                        src={
                          work.largeThumbnailImageURL ??
                          work.smallThumbnailImageURL
                        }
                        alt={t.workTitle(work.title ?? "", work.enTitle ?? "")}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <RankMedalBadge
                      rank={rank}
                      className="absolute top-1.5 left-1.5"
                    />
                  </Link>
                  <p className="w-full truncate text-center font-bold text-xs md:text-sm">
                    {t.workTitle(work.title ?? "", work.enTitle ?? "")}
                  </p>
                  {work.user && (
                    <Link
                      to={`/users/${work.user.login ?? work.user.id}`}
                      className="flex max-w-full items-center gap-1 text-muted-foreground text-xs"
                    >
                      <Avatar className="size-5">
                        <AvatarImage
                          src={toIconImageUrl(work.user.iconUrl)}
                          alt=""
                        />
                        <AvatarFallback className="text-[9px]">
                          {(work.user.name ?? "?").slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{work.user.name}</span>
                    </Link>
                  )}
                  <span className="flex items-center gap-1 font-bold text-rose-600 text-xs dark:text-rose-400">
                    <Heart
                      className="size-3.5 fill-current"
                      aria-hidden="true"
                    />
                    {(work.likesCount ?? 0).toLocaleString()}
                  </span>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <section
        id="event-works"
        className="scroll-mt-20 space-y-4 rounded-3xl border bg-card p-4 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-xl md:text-2xl">
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
              targetUrl={
                isSensitivePage
                  ? `/events/${event.slug}`
                  : `/r/events/${event.slug}`
              }
            />
          )}
        </div>

        {event.works.length === 0 && data.page === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              {isEnded
                ? t("参加作品はありませんでした", "There were no entries")
                : t(
                    "まだ参加作品がありません。最初の1作品を投稿して一番乗りしよう！",
                    "No entries yet. Be the first to post!",
                  )}
            </p>
            {!isEnded && (
              <Link to={postUrl} className={appPillTabClassName(true)}>
                <PenLine className="mr-1.5 size-4" aria-hidden="true" />
                {t("このイベントに参加する", "Join this event")}
              </Link>
            )}
          </div>
        ) : (
          <EventWorkList
            works={event.works}
            basePath={isSensitivePage ? "/r/events" : "/events"}
            defaultRatings={
              isSensitivePage
                ? SENSITIVE_EVENT_WORK_RATINGS
                : DEFAULT_EVENT_WORK_RATINGS
            }
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
            chipSortTypes={workSortTabs}
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
            revealSensitiveThumbnails={
              isSensitivePage || revealSensitiveThumbnails
            }
          />
        )}
      </section>

      {/* 一覧を見終わったあとにも参加ボタン */}
      {!isEnded && event.works.length > 0 && (
        <section className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 via-fuchsia-500 to-violet-600 px-5 py-9 text-center text-white">
          <Sparkles className="size-7" aria-hidden="true" />
          <h2 className="font-black text-xl">
            {hasJoined
              ? t("もう1作品、参加してみよう", "Post one more entry")
              : t("あなたの作品もここに並べよう", "Put your art here too")}
          </h2>
          {event.mainTag && (
            <p className="text-sm text-white/90">
              {t(
                "投稿時にタグ「#{{tag}}」を付けると参加できます",
                "Add the tag #{{tag}} when posting to join",
              ).replace("{{tag}}", event.mainTag)}
            </p>
          )}
          <Link
            to={postUrl}
            className="flex h-12 items-center gap-2 rounded-full bg-white px-7 font-black text-fuchsia-700 shadow-md transition hover:bg-white/90"
          >
            <PenLine className="size-4" aria-hidden="true" />
            {t("このイベントに参加する（投稿する）", "Join this event (post)")}
          </Link>
        </section>
      )}
    </div>
  )
}

function XLogo(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={props.className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
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
      isOfficial
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
