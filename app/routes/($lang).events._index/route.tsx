import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Form, Link, type MetaFunction, useLoaderData } from "@remix-run/react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  History,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  AppEventCard,
  type EventCardItem,
} from "~/routes/($lang).events._index/components/app-event-card"
import { createMeta } from "~/utils/create-meta"

type EventSortType =
  | "SCHEDULE"
  | "ONGOING_FIRST"
  | "POPULAR"
  | "CLOSING_SOON"
  | "NEWEST"

const EVENTS_PAGE_LIMIT = 16

const ONGOING_EVENTS_SUMMARY_LIMIT = 200

const getEventPriority = (status: string) => {
  if (status === "UPCOMING") {
    return 1
  }

  if (status === "ENDED") {
    return 2
  }

  return 0
}

const normalizeOfficialEvent = (event: any): EventCardItem => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl: event.thumbnailImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tags: event.tag ? [event.tag] : [],
  status: event.status,
  isOfficial: true,
  rankingEnabled: false,
  entryCount: event.worksCount ?? 0,
  participantCount: 0,
  userIconUrl: null,
  userName: "Aipictors",
})

const normalizeUserEvent = (event: any): EventCardItem => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  startAt: event.startAt,
  endAt: event.endAt,
  tags: event.tags,
  status: event.status,
  isOfficial: false,
  rankingEnabled: event.rankingEnabled,
  entryCount: event.entryCount,
  participantCount: event.participantCount,
  userId: event.userId,
  userIconUrl: event.userIconUrl ?? null,
  userName: event.userName,
})

const buildUserEventIconMap = async (userIds: string[]) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))]

  const responses = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const response = await loaderClient.query({
          query: eventUserIconQuery,
          variables: {
            userId,
          },
        })

        return [userId, response.data.user?.iconUrl ?? null] as const
      } catch {
        return [userId, null] as const
      }
    }),
  )

  return new Map<string, string | null>(responses)
}

const sortEventsBySchedule = (events: EventCardItem[]) => {
  return [...events].sort((a, b) => {
    const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status)

    if (priorityDiff !== 0) {
      return priorityDiff
    }

    if (a.status === "ENDED") {
      return b.endAt - a.endAt
    }

    return a.startAt - b.startAt
  })
}

const sortEvents = (events: EventCardItem[], sort: EventSortType) => {
  const copied = [...events]

  if (sort === "SCHEDULE") {
    return sortEventsBySchedule(copied)
  }

  if (sort === "POPULAR") {
    return copied.sort((a, b) => {
      const scoreA = a.entryCount * 3 + a.participantCount * 5
      const scoreB = b.entryCount * 3 + b.participantCount * 5
      return scoreB - scoreA
    })
  }

  if (sort === "CLOSING_SOON") {
    return copied.sort((a, b) => a.endAt - b.endAt)
  }

  if (sort === "NEWEST") {
    return copied.sort((a, b) => b.startAt - a.startAt)
  }

  return copied.sort((a, b) => {
    const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status)

    if (priorityDiff !== 0) {
      return priorityDiff
    }

    if (a.status === "ENDED") {
      return b.endAt - a.endAt
    }

    return a.endAt - b.endAt
  })
}

const countEventsByStatus = (events: EventCardItem[]) => {
  return {
    ongoing: events.filter((event) => event.status === "ONGOING").length,
    upcoming: events.filter((event) => event.status === "UPCOMING").length,
    ended: events.filter((event) => event.status === "ENDED").length,
  }
}

const countActiveEvents = (events: EventCardItem[]) => {
  return events.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING",
  ).length
}

const buildOngoingEventSummary = (props: {
  officialEvents: Array<{ worksCount?: number | null }>
  userEvents: Array<{ entryCount?: number | null }>
}) => {
  const ongoingEventCount =
    props.officialEvents.length + props.userEvents.length

  const ongoingEntryCount =
    props.officialEvents.reduce(
      (sum, event) => sum + (event.worksCount ?? 0),
      0,
    ) +
    props.userEvents.reduce((sum, event) => sum + (event.entryCount ?? 0), 0)

  return {
    ongoingEventCount,
    ongoingEntryCount,
  }
}

type EventListSectionProps = {
  events: EventCardItem[]
  /**
   * ユーザー企画タブでは「企画を作る」の案内を出す
   */
  showCreateCta?: boolean
}

const ENDED_EVENTS_INITIAL_LIMIT = 6

const DAY_SECONDS = 60 * 60 * 24

const shuffleEvents = (events: EventCardItem[]) => {
  const copied = [...events]

  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copied[i], copied[j]] = [copied[j], copied[i]]
  }

  return copied
}

const buildVisiblePages = (currentPage: number, hasNextPage: boolean) => {
  const pages = new Set<number>([0, currentPage])

  if (currentPage > 0) {
    pages.add(currentPage - 1)
  }

  if (currentPage > 1) {
    pages.add(1)
  }

  if (hasNextPage) {
    pages.add(currentPage + 1)
  }

  if (hasNextPage && currentPage === 0) {
    pages.add(2)
  }

  return [...pages].filter((page) => page >= 0).sort((a, b) => a - b)
}

function FeaturedEventRotator(props: { events: EventCardItem[] }) {
  const t = useTranslation()

  // SSR とハイドレーションで同じ表示にするため、並べ替えはマウント後に行う
  const [shuffledEvents, setShuffledEvents] = useState(props.events)

  useEffect(() => {
    // ユーザー企画を先に見せる（それぞれの中は順番をばらす）
    setShuffledEvents([
      ...shuffleEvents(props.events.filter((event) => !event.isOfficial)),
      ...shuffleEvents(props.events.filter((event) => event.isOfficial)),
    ])
  }, [props.events])

  const [currentIndex, setCurrentIndex] = useState(0)
  const swipeStartXRef = useRef<number | null>(null)
  const didSwipeRef = useRef(false)

  const SWIPE_THRESHOLD = 40

  useEffect(() => {
    setCurrentIndex(0)
  }, [shuffledEvents])

  useEffect(() => {
    if (shuffledEvents.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledEvents.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [shuffledEvents])

  if (shuffledEvents.length === 0) {
    return null
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    swipeStartXRef.current = event.clientX
    didSwipeRef.current = false
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (shuffledEvents.length <= 1 || swipeStartXRef.current === null) {
      swipeStartXRef.current = null
      return
    }

    const deltaX = event.clientX - swipeStartXRef.current
    swipeStartXRef.current = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    didSwipeRef.current = true

    if (deltaX < 0) {
      setCurrentIndex((prev) => (prev + 1) % shuffledEvents.length)
      return
    }

    setCurrentIndex(
      (prev) => (prev - 1 + shuffledEvents.length) % shuffledEvents.length,
    )
  }

  const onPointerCancel = () => {
    swipeStartXRef.current = null
  }

  const onClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!didSwipeRef.current) {
      return
    }

    event.preventDefault()
    didSwipeRef.current = false
  }

  const onClickPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + shuffledEvents.length) % shuffledEvents.length,
    )
  }

  const onClickNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shuffledEvents.length)
  }

  const event = shuffledEvents[currentIndex]

  const hasMultiple = shuffledEvents.length > 1

  const arrowClassName =
    "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("注目のイベント", "Featured events")}
      className="touch-pan-y overflow-hidden rounded-2xl border bg-card shadow-sm"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="relative md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative">
          <Link
            to={`/events/${event.slug}`}
            className="group relative block aspect-[16/9] overflow-hidden bg-black"
            onClickCapture={onClickCapture}
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={event.thumbnailImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
              aria-hidden="true"
            />
            <img
              src={event.thumbnailImageUrl}
              alt={event.title}
              className="relative h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
            />
          </Link>
          {hasMultiple && (
            <>
              <button
                type="button"
                className={`${arrowClassName} left-2`}
                onClick={onClickPrev}
                aria-label={t("前のイベントへ", "Previous event")}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${arrowClassName} right-2`}
                onClick={onClickNext}
                aria-label={t("次のイベントへ", "Next event")}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <div className="-translate-x-1/2 absolute bottom-2 left-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-sm">
                {shuffledEvents.map((rotatorEvent, index) => (
                  <button
                    key={rotatorEvent.id}
                    type="button"
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={t(
                      "{{count}}件目のイベントを表示",
                      "Show event {{count}}",
                    ).replace("{{count}}", String(index + 1))}
                    aria-current={index === currentIndex ? "true" : undefined}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <Link
          to={`/events/${event.slug}`}
          className="group flex flex-col justify-center gap-2.5 p-4 md:gap-3 md:p-6"
          onClickCapture={onClickCapture}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 font-semibold text-muted-foreground text-xs">
              <Sparkles className="size-3.5" aria-hidden="true" />
              {t("注目", "Featured")}
              {hasMultiple && (
                <span className="tabular-nums">
                  {currentIndex + 1}/{shuffledEvents.length}
                </span>
              )}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-bold text-white text-xs ${
                event.status === "ONGOING" ? "bg-rose-600" : "bg-sky-700"
              }`}
            >
              {event.status === "ONGOING"
                ? t("開催中", "Ongoing")
                : t("開催予定", "Upcoming")}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-medium text-xs ${
                event.isOfficial
                  ? "border bg-background"
                  : "bg-violet-700 text-white"
              }`}
            >
              {event.isOfficial
                ? t("公式イベント", "Official event")
                : t("ユーザー企画", "User event")}
            </span>
          </div>
          <h2 className="line-clamp-2 font-bold text-xl leading-tight md:text-2xl">
            {event.title}
          </h2>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed md:line-clamp-3">
            {event.description
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim()}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-muted px-3 py-1">
              {t("作品", "Entries")}{" "}
              <span className="font-bold">{event.entryCount}</span>
            </span>
            {event.userName && (
              <span className="truncate text-muted-foreground">
                {t("主催", "Host")}: {event.userName}
              </span>
            )}
          </div>
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#0077d9] px-4 py-2 font-semibold text-sm text-white transition group-hover:bg-[#0068c0] dark:bg-[#0b74c9]">
            {t("詳しく見る・参加する", "View & join")}
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  )
}

/**
 * 「ユーザー企画」の説明と作成への導線
 */
function CreateEventCta(props: { compact?: boolean }) {
  const t = useTranslation()

  return (
    <a
      href="/events/new"
      className={`group flex h-full flex-col justify-center gap-2 rounded-2xl border-2 border-dashed bg-card/50 p-5 transition hover:border-[#0077d9] hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        props.compact ? "" : "min-h-48 items-center text-center"
      }`}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-[#0077d9] text-white dark:bg-[#0b74c9]">
        <Plus className="size-5" aria-hidden="true" />
      </span>
      <span className="font-bold text-sm md:text-base">
        {t("あなたも企画を作ろう", "Host your own event")}
      </span>
      <span className="max-w-xs text-muted-foreground text-xs leading-relaxed">
        {t(
          "テーマと期間を決めるだけで、だれでもイラスト企画を開けます。参加作品は企画ページにまとまり、ランキングも使えます。",
          "Pick a theme and dates to host an art event. Entries are collected on your event page, with optional rankings.",
        )}
      </span>
      <span className="font-semibold text-[#0077d9] text-sm group-hover:underline dark:text-sky-400">
        {t("企画を作る →", "Create an event →")}
      </span>
    </a>
  )
}

function SectionHeading(props: {
  icon: ReactNode
  title: string
  muted?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3
        className={`flex items-center gap-1.5 font-bold text-base md:text-lg ${
          props.muted ? "text-muted-foreground" : ""
        }`}
      >
        {props.icon}
        {props.title}
      </h3>
      {props.children}
    </div>
  )
}

function EventListSection(props: EventListSectionProps) {
  const t = useTranslation()

  const [showAllEnded, setShowAllEnded] = useState(false)

  const statusCounts = countEventsByStatus(props.events)

  const activeEvents = props.events.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING",
  )

  const endedEvents = props.events.filter((event) => event.status === "ENDED")

  const visibleEndedEvents = showAllEnded
    ? endedEvents
    : endedEvents.slice(0, ENDED_EVENTS_INITIAL_LIMIT)

  // 開催中で残り3日以内のもの
  const nowSeconds = Date.now() / 1000
  const closingSoonCount = activeEvents.filter(
    (event) =>
      event.status === "ONGOING" && event.endAt - nowSeconds <= DAY_SECONDS * 3,
  ).length

  if (props.events.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground text-sm">
          {t(
            "条件に一致するイベントは見つかりませんでした。別のキーワードや状態でお試しください。",
            "No events matched your filters. Try a different keyword or status.",
          )}
        </div>
        {props.showCreateCta && <CreateEventCta compact />}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <SectionHeading
          icon={<Flame className="size-5 text-rose-600" aria-hidden="true" />}
          title={t("開催中・開催予定", "Ongoing & upcoming")}
        >
          {statusCounts.ongoing > 0 && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 font-semibold text-white text-xs">
              {t("開催中", "Ongoing")} {statusCounts.ongoing}
            </span>
          )}
          {statusCounts.upcoming > 0 && (
            <span className="rounded-full bg-sky-700 px-2 py-0.5 font-semibold text-white text-xs">
              {t("開催予定", "Upcoming")} {statusCounts.upcoming}
            </span>
          )}
          {closingSoonCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-700 px-2 py-0.5 font-semibold text-white text-xs">
              <Clock className="size-3" aria-hidden="true" />
              {t("締切間近", "Closing soon")} {closingSoonCount}
            </span>
          )}
        </SectionHeading>
        {activeEvents.length === 0 ? (
          props.showCreateCta ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {t(
                  "いま開催中・開催予定の企画はありません。最初の企画を作ってみませんか？",
                  "No ongoing or upcoming events right now. Why not host the first one?",
                )}
              </p>
              <CreateEventCta compact />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
              {t(
                "いま開催中・開催予定のイベントはありません。",
                "There are no ongoing or upcoming events right now.",
              )}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {activeEvents.map((appEvent) => (
              <AppEventCard key={appEvent.id} appEvent={appEvent} />
            ))}
            {props.showCreateCta && <CreateEventCta />}
          </div>
        )}
      </section>
      {endedEvents.length > 0 && (
        <section className="space-y-3">
          <SectionHeading
            icon={<History className="size-5" aria-hidden="true" />}
            title={t("終了したイベント", "Past events")}
            muted
          >
            <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground text-xs">
              {statusCounts.ended}
            </span>
          </SectionHeading>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
            {visibleEndedEvents.map((appEvent) => (
              <AppEventCard
                key={appEvent.id}
                appEvent={appEvent}
                variant="compact"
              />
            ))}
          </div>
          {endedEvents.length > ENDED_EVENTS_INITIAL_LIMIT && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-6"
                onClick={() => setShowAllEnded((prev) => !prev)}
                aria-expanded={showAllEnded}
              >
                {showAllEnded
                  ? t("閉じる", "Show less")
                  : t(
                      "もっと見る（あと{{count}}件）",
                      "Show more ({{count}} more)",
                    ).replace(
                      "{{count}}",
                      String(endedEvents.length - ENDED_EVENTS_INITIAL_LIMIT),
                    )}
                <ChevronDown
                  className={`size-4 transition ${showAllEnded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function EventCategoryTabTrigger(props: {
  value: string
  title: string
  description: string
  activeCount: number
}) {
  const t = useTranslation()

  return (
    <TabsTrigger
      value={props.value}
      className="group h-auto flex-1 rounded-xl px-3 py-2 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm md:px-4 md:py-2.5"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <div className="font-bold text-sm leading-tight md:text-base">
            {props.title}
          </div>
          <div className="hidden truncate font-normal text-muted-foreground text-xs sm:block">
            {props.description}
          </div>
        </div>
        {props.activeCount > 0 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-muted-foreground/15 px-2 py-0.5 font-semibold text-xs group-data-[state=active]:bg-rose-600 group-data-[state=active]:text-white">
            <span className="hidden sm:inline">{t("開催", "Live")}</span>
            {props.activeCount}
          </div>
        )}
      </div>
    </TabsTrigger>
  )
}

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  const urlParams = new URLSearchParams(props.request.url.split("?")[1])

  const pageParam = urlParams.get("page")

  const rawPage = pageParam ? Number(pageParam) : 0
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0

  const keyword = urlParams.get("q")?.trim() ?? ""

  const status = urlParams.get("status")?.trim() ?? ""

  const ranking = urlParams.get("ranking")?.trim() ?? "ALL"

  const sort = (urlParams.get("sort")?.trim() ?? "SCHEDULE") as EventSortType

  const [resp, ongoingEventsSummaryResp] = await Promise.all([
    loaderClient.query({
      query: eventsQuery,
      variables: {
        offset: page * EVENTS_PAGE_LIMIT,
        limit: EVENTS_PAGE_LIMIT,
        appEventWhere: {
          ...(keyword.length > 0 && { keyword }),
          ...(status.length > 0 && { status }),
        },
        userEventWhere: {
          ...(keyword.length > 0 && { keyword }),
          ...(status.length > 0 && { status }),
          ...(ranking === "RANKING" && { rankingEnabled: true }),
          ...(ranking === "CASUAL" && { rankingEnabled: false }),
          ...(sort !== "SCHEDULE" && { sort }),
        },
      },
    }),
    loaderClient.query({
      query: ongoingEventsSummaryQuery,
      variables: {
        offset: 0,
        limit: ONGOING_EVENTS_SUMMARY_LIMIT,
        appEventWhere: {
          status: "ONGOING",
        },
        userEventWhere: {
          status: "ONGOING",
        },
      },
    }),
  ])

  const userIconMap = await buildUserEventIconMap(
    resp.data.userEvents.map((event: any) => event.userId).filter(Boolean),
  )

  const userEventsWithIcons = resp.data.userEvents.map((event: any) => ({
    ...event,
    userIconUrl: event.userId ? (userIconMap.get(event.userId) ?? null) : null,
  }))

  const officialEvents = sortEvents(
    resp.data.appEvents.map(normalizeOfficialEvent),
    sort,
  )

  const userEvents = sortEvents(
    userEventsWithIcons.map(normalizeUserEvent),
    sort,
  )

  const hasNextPage =
    resp.data.appEvents.length === EVENTS_PAGE_LIMIT ||
    resp.data.userEvents.length === EVENTS_PAGE_LIMIT

  return {
    officialEvents,
    userEvents,
    page,
    hasPreviousPage: page > 0,
    hasNextPage,
    ongoingSummary: buildOngoingEventSummary({
      officialEvents: ongoingEventsSummaryResp.data.appEvents,
      userEvents: ongoingEventsSummaryResp.data.userEvents,
    }),
    filters: {
      keyword,
      status,
      ranking,
      sort,
    },
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const formatNumberWithCommas = (value: number) => {
    return value.toLocaleString()
  }

  const officialEvents = data.officialEvents

  const userEvents = data.userEvents

  const featuredEvents = [...userEvents, ...officialEvents].filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING",
  )

  // ユーザー企画を最初に見せる（無いときだけ公式）
  const defaultTab =
    userEvents.length > 0 || officialEvents.length === 0 ? "user" : "official"

  const hasActiveFilters =
    data.filters.keyword.length > 0 ||
    data.filters.status.length > 0 ||
    data.filters.ranking !== "ALL" ||
    data.filters.sort !== "SCHEDULE"

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams()

    if (data.filters.keyword) {
      params.set("q", data.filters.keyword)
    }

    if (data.filters.status) {
      params.set("status", data.filters.status)
    }

    if (data.filters.ranking && data.filters.ranking !== "ALL") {
      params.set("ranking", data.filters.ranking)
    }

    if (data.filters.sort && data.filters.sort !== "SCHEDULE") {
      params.set("sort", data.filters.sort)
    }

    if (page > 0) {
      params.set("page", String(page))
    }

    const query = params.toString()
    return query.length > 0 ? `?${query}` : "."
  }

  const visiblePages = buildVisiblePages(data.page, data.hasNextPage)

  if (data === null) {
    return null
  }

  const selectClassName =
    "h-10 rounded-lg border bg-background px-3 py-2 text-sm"

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <header className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-violet-100 via-sky-50 to-rose-100 p-4 md:p-6 dark:from-violet-950/60 dark:via-sky-950/40 dark:to-rose-950/40">
        <div
          className="-right-10 -top-16 pointer-events-none absolute size-48 rounded-full bg-violet-400/20 blur-3xl md:size-72"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="min-w-0 space-y-1.5">
            <h1 className="flex items-center gap-2 font-bold text-xl md:text-3xl">
              <Sparkles
                className="size-5 text-violet-600 md:size-7 dark:text-violet-400"
                aria-hidden="true"
              />
              {t("イベント・企画", "Events")}
            </h1>
            <p className="max-w-2xl text-muted-foreground text-xs leading-relaxed md:text-sm">
              {t(
                "ユーザーが主催する企画や公式イベントに、AIイラストで参加しよう。だれでも自分の企画を作れます。",
                "Join user-hosted and official events with your AI art. Anyone can host their own event.",
              )}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5 text-xs md:text-sm">
              <span className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-500 opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose-600" />
                </span>
                {t("開催中", "Ongoing")}
                <span className="font-bold">
                  {formatNumberWithCommas(
                    data.ongoingSummary.ongoingEventCount,
                  )}
                </span>
                {t("件", "")}
              </span>
              <span className="text-muted-foreground">
                {t("参加作品", "Entries")}{" "}
                <span className="font-bold text-foreground">
                  {formatNumberWithCommas(
                    data.ongoingSummary.ongoingEntryCount,
                  )}
                </span>
              </span>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 md:flex">
            <Button asChild className="rounded-full md:h-11 md:px-6">
              <a href="/events/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("企画を作る", "Host an event")}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full bg-background/80 md:h-11 md:px-6"
            >
              <a href="/my/events">{t("マイイベント", "My events")}</a>
            </Button>
          </div>
        </div>
      </header>
      <FeaturedEventRotator events={featuredEvents} />
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="flex h-auto w-full gap-1 rounded-2xl bg-muted p-1">
          <EventCategoryTabTrigger
            value="user"
            title={t("ユーザー企画", "User events")}
            description={t(
              "みんなが主催している企画",
              "Events hosted by the community",
            )}
            activeCount={countActiveEvents(userEvents)}
          />
          <EventCategoryTabTrigger
            value="official"
            title={t("公式イベント", "Official events")}
            description={t(
              "Aipictors主催のコンテスト",
              "Contests hosted by Aipictors",
            )}
            activeCount={countActiveEvents(officialEvents)}
          />
        </TabsList>
        <details
          className="group rounded-2xl border bg-card"
          open={hasActiveFilters}
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
            <Search
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {t("検索・絞り込み", "Search & filter")}
            {hasActiveFilters && (
              <span className="rounded-full bg-[#0077d9] px-2 py-0.5 text-white text-xs">
                {t("絞り込み中", "Filtered")}
              </span>
            )}
            <ChevronDown
              className="ml-auto size-4 text-muted-foreground transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <Form
            className="grid gap-3 border-t p-4 md:grid-cols-2 xl:grid-cols-[1fr_160px_170px_150px_auto]"
            method="get"
          >
            <Input
              name="q"
              aria-label={t("イベントを検索", "Search events")}
              defaultValue={data.filters.keyword}
              placeholder={t(
                "イベント名・主催者・説明・タグで検索",
                "Search by title, host, description, or tag",
              )}
              className="h-10 rounded-lg"
            />
            <select
              name="status"
              aria-label={t("開催状態", "Status")}
              defaultValue={data.filters.status}
              className={selectClassName}
            >
              <option value="">{t("すべての状態", "All statuses")}</option>
              <option value="ONGOING">{t("開催中", "Ongoing")}</option>
              <option value="UPCOMING">{t("開催予定", "Upcoming")}</option>
              <option value="ENDED">{t("終了", "Ended")}</option>
            </select>
            <select
              name="ranking"
              aria-label={t("ランキング条件", "Ranking type")}
              defaultValue={data.filters.ranking}
              className={selectClassName}
            >
              <option value="ALL">
                {t("ランキング条件すべて", "All ranking types")}
              </option>
              <option value="RANKING">
                {t("ランキングあり", "Ranking enabled")}
              </option>
              <option value="CASUAL">
                {t("ランキングなし", "No ranking")}
              </option>
            </select>
            <select
              name="sort"
              aria-label={t("並び順", "Sort")}
              defaultValue={data.filters.sort}
              className={selectClassName}
            >
              <option value="SCHEDULE">{t("開催順", "Schedule order")}</option>
              <option value="ONGOING_FIRST">
                {t("開催中優先", "Ongoing first")}
              </option>
              <option value="POPULAR">{t("人気順", "Popular")}</option>
              <option value="CLOSING_SOON">
                {t("締切が近い順", "Closing soon")}
              </option>
              <option value="NEWEST">{t("新着順", "Newest")}</option>
            </select>
            <div className="flex gap-2">
              <Button className="w-full rounded-lg md:w-auto" type="submit">
                {t("検索", "Search")}
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full rounded-lg md:w-auto"
              >
                <a href=".">{t("リセット", "Reset")}</a>
              </Button>
            </div>
          </Form>
        </details>
        <TabsContent value="user" className="m-0">
          <EventListSection events={userEvents} showCreateCta />
        </TabsContent>
        <TabsContent value="official" className="m-0">
          <EventListSection events={officialEvents} />
        </TabsContent>
      </Tabs>
      {(data.hasPreviousPage || data.hasNextPage) && (
        <nav
          aria-label={t("ページ", "Pages")}
          className="flex flex-wrap items-center justify-center gap-2 py-2"
        >
          <Button
            asChild
            variant="outline"
            className="rounded-lg"
            disabled={!data.hasPreviousPage}
          >
            <a
              aria-disabled={!data.hasPreviousPage}
              href={
                data.hasPreviousPage ? buildPageHref(data.page - 1) : undefined
              }
            >
              {t("前へ", "Prev")}
            </a>
          </Button>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1]
            const shouldRenderGap =
              typeof previousPage === "number" && page - previousPage > 1

            return (
              <div key={page} className="flex items-center gap-2">
                {shouldRenderGap && (
                  <span className="px-1 text-muted-foreground text-sm">
                    ...
                  </span>
                )}
                <Button
                  asChild
                  variant={page === data.page ? "default" : "outline"}
                  className="rounded-lg"
                >
                  <a
                    aria-current={page === data.page ? "page" : undefined}
                    href={buildPageHref(page)}
                  >
                    {page + 1}
                  </a>
                </Button>
              </div>
            )
          })}
          <Button
            asChild
            variant="outline"
            className="rounded-lg"
            disabled={!data.hasNextPage}
          >
            <a
              aria-disabled={!data.hasNextPage}
              href={data.hasNextPage ? buildPageHref(data.page + 1) : undefined}
            >
              {t("次へ", "Next")}
            </a>
          </Button>
        </nav>
      )}
    </div>
  )
}

const eventsQuery = gql`
  query EventsIndex(
    $limit: Int!
    $offset: Int!
    $appEventWhere: AppEventsWhereInput
    $userEventWhere: UserEventsWhereInput
  ) {
    appEvents(limit: $limit, offset: $offset, where: $appEventWhere) {
      id
      description
      title
      slug
      thumbnailImageUrl
      startAt
      endAt
      tag
      status
      worksCount
    }
    userEvents(limit: $limit, offset: $offset, where: $userEventWhere) {
      id
      title
      slug
      description
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tags
      status
      rankingEnabled
      entryCount
      participantCount
      userId
      userName
    }
  }
`

const ongoingEventsSummaryQuery = gql`
  query OngoingEventsSummary(
    $limit: Int!
    $offset: Int!
    $appEventWhere: AppEventsWhereInput
    $userEventWhere: UserEventsWhereInput
  ) {
    appEvents(limit: $limit, offset: $offset, where: $appEventWhere) {
      id
      worksCount
    }
    userEvents(limit: $limit, offset: $offset, where: $userEventWhere) {
      id
      entryCount
    }
  }
`

const eventUserIconQuery = gql`
  query EventUserIcon($userId: ID!) {
    user(id: $userId) {
      id
      iconUrl
    }
  }
`
