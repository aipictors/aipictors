import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Form, Link, type MetaFunction, useLoaderData } from "@remix-run/react"
import { ChevronDown, Plus, Search } from "lucide-react"
import {
  type MouseEvent as ReactMouseEvent,
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
}

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

  return (
    <section
      className="touch-pan-y overflow-hidden rounded-2xl border bg-card shadow-sm"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <Link
        to={`/events/${event.slug}`}
        className="group block"
        onClickCapture={onClickCapture}
      >
        <div className="md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative aspect-[16/9] overflow-hidden bg-black">
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
          </div>
          <div className="flex flex-col justify-center gap-3 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-muted-foreground text-xs">
                {t("注目のイベント", "Featured")}
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
            <span className="font-semibold text-[#0077d9] text-sm group-hover:underline">
              {t("詳しく見る・参加する →", "View & join →")}
            </span>
          </div>
        </div>
      </Link>
      {shuffledEvents.length > 1 && (
        <div className="flex items-center justify-center gap-2 border-t bg-card px-4 py-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClickPrev}
            aria-label={t("前のイベントへ", "Previous event")}
          >
            {t("前へ", "Prev")}
          </Button>
          {shuffledEvents.map((rotatorEvent, index) => (
            <button
              key={rotatorEvent.id}
              type="button"
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-foreground"
                  : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
              aria-label={t(
                "{{count}}件目のイベントを表示",
                "Show event {{count}}",
              ).replace("{{count}}", String(index + 1))}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClickNext}
            aria-label={t("次のイベントへ", "Next event")}
          >
            {t("次へ", "Next")}
          </Button>
        </div>
      )}
    </section>
  )
}

function EventGrid(props: { events: EventCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {props.events.map((appEvent) => (
        <AppEventCard key={appEvent.id} appEvent={appEvent} />
      ))}
    </div>
  )
}

function EventListSection(props: EventListSectionProps) {
  const t = useTranslation()

  const statusCounts = countEventsByStatus(props.events)

  const activeEvents = props.events.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING",
  )

  const endedEvents = props.events.filter((event) => event.status === "ENDED")

  if (props.events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground text-sm">
        {t(
          "条件に一致するイベントは見つかりませんでした。別のキーワードや状態でお試しください。",
          "No events matched your filters. Try a different keyword or status.",
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-base md:text-lg">
              {t("開催中・開催予定", "Ongoing & upcoming")}
            </h3>
            <span className="rounded-full bg-rose-600 px-2 py-0.5 font-semibold text-white text-xs">
              {t("開催中", "Ongoing")} {statusCounts.ongoing}
            </span>
            {statusCounts.upcoming > 0 && (
              <span className="rounded-full bg-sky-700 px-2 py-0.5 font-semibold text-white text-xs">
                {t("開催予定", "Upcoming")} {statusCounts.upcoming}
              </span>
            )}
          </div>
          <EventGrid events={activeEvents} />
        </section>
      )}
      {activeEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
          {t(
            "いま開催中・開催予定のイベントはありません。",
            "There are no ongoing or upcoming events right now.",
          )}
        </div>
      )}
      {endedEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-muted-foreground md:text-lg">
              {t("終了したイベント", "Past events")}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground text-xs">
              {statusCounts.ended}
            </span>
          </div>
          <EventGrid events={endedEvents} />
        </section>
      )}
    </div>
  )
}

function EventCategoryTabTrigger(props: {
  value: string
  title: string
  description: string
  count: number
}) {
  return (
    <TabsTrigger
      value={props.value}
      className="group h-auto flex-1 rounded-xl px-4 py-2.5 text-left data-[state=active]:bg-background data-[state=active]:shadow-sm"
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="font-bold text-sm leading-tight md:text-base">
            {props.title}
          </div>
          <div className="hidden truncate text-muted-foreground text-xs sm:block">
            {props.description}
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-muted-foreground/15 px-2.5 py-0.5 font-semibold text-xs group-data-[state=active]:bg-[#0077d9] group-data-[state=active]:text-white">
          {props.count}
        </div>
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
      <header className="overflow-hidden rounded-2xl border bg-linear-to-br from-violet-50 via-sky-50 to-rose-50 p-5 md:p-6 dark:from-violet-950/40 dark:via-sky-950/30 dark:to-rose-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-bold text-2xl md:text-3xl">
              {t("イベント・企画", "Events")}
            </h1>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              {t(
                "ユーザーが主催する企画や公式イベントに、AIイラストで参加しよう。だれでも自分の企画を作れます。",
                "Join user-hosted and official events with your AI art. Anyone can host their own event.",
              )}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-sm">
              <span className="rounded-full border bg-background/80 px-3 py-1">
                {t("開催中", "Ongoing")}{" "}
                <span className="font-bold">
                  {formatNumberWithCommas(
                    data.ongoingSummary.ongoingEventCount,
                  )}
                </span>
                {t("件", "")}
              </span>
              <span className="rounded-full border bg-background/80 px-3 py-1">
                {t("参加作品", "Entries")}{" "}
                <span className="font-bold">
                  {formatNumberWithCommas(
                    data.ongoingSummary.ongoingEntryCount,
                  )}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" className="rounded-xl">
              <a href="/events/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("企画を作る", "Host an event")}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
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
            count={userEvents.length}
          />
          <EventCategoryTabTrigger
            value="official"
            title={t("公式イベント", "Official events")}
            description={t(
              "Aipictors主催のコンテスト",
              "Contests hosted by Aipictors",
            )}
            count={officialEvents.length}
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
          <EventListSection events={userEvents} />
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
