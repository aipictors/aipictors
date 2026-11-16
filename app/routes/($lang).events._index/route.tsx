import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  Form,
  type MetaFunction,
  useLoaderData,
  useLocation,
  useParams,
} from "@remix-run/react"
import {
  ChevronRight,
  Flame,
  History,
  Plus,
  Search,
  Sparkles,
  Timer,
} from "lucide-react"
import { type ReactNode, useState } from "react"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import {
  appFilterChipClassName,
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import {
  AppEventCard,
  type EventCardItem,
  isR18OnlyEvent,
} from "~/routes/($lang).events._index/components/app-event-card"
import { createCollectionJsonLd } from "~/utils/collection-json-ld"
import { createMeta } from "~/utils/create-meta"

type EventSortType =
  | "SCHEDULE"
  | "ONGOING_FIRST"
  | "POPULAR"
  | "CLOSING_SOON"
  | "NEWEST"

/** 一覧の切り替え（丸いタブ）。ALL はキーワード検索のときだけ */
type EventStatusTab = "ONGOING" | "UPCOMING" | "ENDED" | "ALL"

type EventKind = "all" | "user" | "official"

const EVENTS_PAGE_LIMIT = 16

const ONGOING_EVENTS_SUMMARY_LIMIT = 200

const toStatusTab = (value: string | null, hasKeyword: boolean) => {
  if (value === "ONGOING" || value === "UPCOMING" || value === "ENDED") {
    return value
  }
  if (value === "ALL") {
    return "ALL"
  }
  // 何も選んでいないときは開催中（検索したときはすべて）
  return hasKeyword ? "ALL" : "ONGOING"
}

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
  participantIcons: event.participantIcons ?? [],
  isR18Only: isR18OnlyEvent(event.ratings),
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

/**
 * 開催中は締切が近い順、開催予定は始まる順、終了は新しく終わった順
 */
const sortEventsBySchedule = (events: EventCardItem[]) => {
  return [...events].sort((a, b) => {
    const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status)

    if (priorityDiff !== 0) {
      return priorityDiff
    }

    if (a.status === "ENDED") {
      return b.endAt - a.endAt
    }

    if (a.status === "UPCOMING") {
      return a.startAt - b.startAt
    }

    return a.endAt - b.endAt
  })
}

const sortEvents = (events: EventCardItem[], sort: EventSortType) => {
  const copied = [...events]

  if (sort === "POPULAR") {
    return copied.sort((a, b) => getPopularity(b) - getPopularity(a))
  }

  if (sort === "CLOSING_SOON") {
    return copied.sort((a, b) => a.endAt - b.endAt)
  }

  if (sort === "NEWEST") {
    return copied.sort((a, b) => b.startAt - a.startAt)
  }

  return sortEventsBySchedule(copied)
}

const getPopularity = (event: EventCardItem) =>
  event.entryCount * 3 + event.participantCount * 5

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

const STATUS_TITLES: Record<EventStatusTab, { ja: string; en: string }> = {
  ONGOING: { ja: "開催中のイベント・企画", en: "Ongoing events" },
  UPCOMING: { ja: "開催予定のイベント・企画", en: "Upcoming events" },
  ENDED: { ja: "終了したイベント・企画", en: "Past events" },
  ALL: { ja: "イベント・企画の検索結果", en: "Event search results" },
}

export const meta: MetaFunction<typeof loader> = (props) => {
  const data = props.data
  if (!data) {
    return createMeta(META.EVENTS, undefined, props.params.lang)
  }

  const status = data.filters.status
  const titles = STATUS_TITLES[status]
  const events = [...data.events]
  const names = events
    .slice(0, 4)
    .map((event) => event.title)
    .join("、")
  const enNames = events
    .slice(0, 4)
    .map((event) => event.title)
    .join(", ")
  const cover = events.find((event) => !event.isR18Only)?.thumbnailImageUrl
  const pageSuffix = data.page > 0 ? `（${data.page + 1}ページ）` : ""
  const enPageSuffix = data.page > 0 ? ` (page ${data.page + 1})` : ""

  return createMeta(
    META.EVENTS_INDEX,
    {
      title:
        status === "ONGOING"
          ? `AIイラストのイベント・コンテスト一覧（開催中${data.ongoingSummary.ongoingEventCount}件）${pageSuffix}`
          : `${titles.ja}${pageSuffix}`,
      enTitle: `${titles.en} - AI art events & contests${enPageSuffix}`,
      description: `Aipictors で${
        status === "ENDED"
          ? "過去に開催された"
          : status === "UPCOMING"
            ? "これから始まる"
            : "いま参加できる"
      }AIイラストのイベント・コンテスト・ユーザー企画。${
        names ? `${names}など。` : ""
      }タグを付けて投稿するだけで参加でき、ランキングや入賞作品も見られます。`,
      enDescription: `${titles.en} on Aipictors.${
        enNames ? ` ${enNames}.` : ""
      } Join AI art events and contests by posting with the event tag.`,
      url: cover ?? config.defaultOgpImageUrl,
    },
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  const urlParams = new URLSearchParams(props.request.url.split("?")[1])

  const pageParam = urlParams.get("page")

  const rawPage = pageParam ? Number(pageParam) : 0
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0

  const keyword = urlParams.get("q")?.trim() ?? ""

  const status = toStatusTab(
    urlParams.get("status")?.trim() || null,
    keyword.length > 0,
  ) as EventStatusTab

  const ranking = urlParams.get("ranking")?.trim() ?? "ALL"

  const sort = (urlParams.get("sort")?.trim() ?? "SCHEDULE") as EventSortType

  const tabParam = urlParams.get("tab")
  const kind: EventKind =
    tabParam === "official" ? "official" : tabParam === "user" ? "user" : "all"

  const statusWhere = status === "ALL" ? {} : { status }

  const resp = await loaderClient.query({
    query: eventsQuery,
    variables: {
      offset: page * EVENTS_PAGE_LIMIT,
      limit: EVENTS_PAGE_LIMIT,
      appEventWhere: {
        ...(keyword.length > 0 && { keyword }),
        ...statusWhere,
      },
      userEventWhere: {
        ...(keyword.length > 0 && { keyword }),
        ...statusWhere,
        ...(ranking === "RANKING" && { rankingEnabled: true }),
        ...(ranking === "CASUAL" && { rankingEnabled: false }),
        ...(sort !== "SCHEDULE" && { sort }),
      },
    },
  })

  // 開催中の 1 ページ目（絞り込みなし）は、いま取った一覧がそのまま開催中の全件なので数え直さない
  const isWholeOngoingList =
    status === "ONGOING" &&
    page === 0 &&
    keyword.length === 0 &&
    ranking === "ALL" &&
    resp.data.appEvents.length < EVENTS_PAGE_LIMIT &&
    resp.data.userEvents.length < EVENTS_PAGE_LIMIT

  const [userIconMap, ongoingEventsSummaryResp] = await Promise.all([
    buildUserEventIconMap(
      resp.data.userEvents.map((event: any) => event.userId).filter(Boolean),
    ),
    isWholeOngoingList
      ? null
      : loaderClient.query({
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

  const userEvents = resp.data.userEvents.map((event: any) =>
    normalizeUserEvent({
      ...event,
      userIconUrl: event.userId
        ? (userIconMap.get(event.userId) ?? null)
        : null,
    }),
  )

  const officialEvents = resp.data.appEvents.map(normalizeOfficialEvent)

  const events = sortEvents([...userEvents, ...officialEvents], sort)

  const hasNextPage =
    resp.data.appEvents.length === EVENTS_PAGE_LIMIT ||
    resp.data.userEvents.length === EVENTS_PAGE_LIMIT

  return {
    events,
    page,
    hasPreviousPage: page > 0,
    hasNextPage,
    ongoingSummary: buildOngoingEventSummary(
      ongoingEventsSummaryResp === null
        ? {
            officialEvents: resp.data.appEvents,
            userEvents: resp.data.userEvents,
          }
        : {
            officialEvents: ongoingEventsSummaryResp.data.appEvents,
            userEvents: ongoingEventsSummaryResp.data.userEvents,
          },
    ),
    filters: {
      keyword,
      status,
      ranking,
      sort,
      kind,
    },
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function EventsIndexPage() {
  const data = useLoaderData<typeof loader>()

  const params = useParams()

  const location = useLocation()

  const t = useTranslation()

  // ユーザー企画・公式の絞り込みは画面の中だけで切り替える（ページを読み直さない）
  const [kind, setKind] = useState<EventKind>(data.filters.kind)

  const status = data.filters.status

  const events = data.events.filter((event) =>
    kind === "all"
      ? true
      : kind === "official"
        ? event.isOfficial
        : !event.isOfficial,
  )

  // 開催中のいちばん盛り上がっている企画を大きく出す（並びは毎回同じ＝表示の食い違いが出ない）
  const featuredEvent =
    status === "ONGOING" && data.page === 0 && events.length > 1
      ? [...events].sort((a, b) => getPopularity(b) - getPopularity(a))[0]
      : null

  const restEvents = featuredEvent
    ? events.filter((event) => event !== featuredEvent)
    : events

  const hasActiveFilters =
    data.filters.keyword.length > 0 ||
    data.filters.ranking !== "ALL" ||
    data.filters.sort !== "SCHEDULE"

  const buildHref = (next: { status?: EventStatusTab; page?: number }) => {
    const query = new URLSearchParams()
    const nextStatus = next.status ?? status

    if (data.filters.keyword) {
      query.set("q", data.filters.keyword)
    }

    if (nextStatus !== (data.filters.keyword ? "ALL" : "ONGOING")) {
      query.set("status", nextStatus)
    }

    if (data.filters.ranking && data.filters.ranking !== "ALL") {
      query.set("ranking", data.filters.ranking)
    }

    if (data.filters.sort && data.filters.sort !== "SCHEDULE") {
      query.set("sort", data.filters.sort)
    }

    if (kind === "official") {
      query.set("tab", "official")
    }

    if (kind === "user") {
      query.set("tab", "user")
    }

    const page = next.page ?? 0
    if (page > 0) {
      query.set("page", String(page))
    }

    // "." だと /events から見てトップページ（/）を指してしまう
    const search = query.toString()
    return search.length > 0
      ? `${location.pathname}?${search}`
      : location.pathname
  }

  const visiblePages = buildVisiblePages(data.page, data.hasNextPage)

  const statusTabs: Array<{
    value: EventStatusTab
    label: string
    icon: ReactNode
  }> = [
    {
      value: "ONGOING",
      label: t("開催中", "Ongoing"),
      icon: <Flame className="size-4" aria-hidden="true" />,
    },
    {
      value: "UPCOMING",
      label: t("もうすぐ", "Coming soon"),
      icon: <Timer className="size-4" aria-hidden="true" />,
    },
    {
      value: "ENDED",
      label: t("終了", "Ended"),
      icon: <History className="size-4" aria-hidden="true" />,
    },
  ]

  const kindChips: Array<{ value: EventKind; label: string }> = [
    { value: "all", label: t("すべて", "All") },
    { value: "user", label: t("ユーザー企画", "User events") },
    { value: "official", label: t("公式", "Official") },
  ]

  const selectClassName =
    "h-10 rounded-full border bg-background px-4 py-2 text-sm"

  const statusTitle =
    params.lang === "en" ? STATUS_TITLES[status].en : STATUS_TITLES[status].ja

  const jsonLdPath =
    status === "ONGOING" || status === "ALL"
      ? "/events"
      : `/events?status=${status}`

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:gap-5">
      <AppJsonLdScript
        jsonLd={createCollectionJsonLd({
          name: t("イベント・企画", "Events"),
          path: jsonLdPath,
          lang: params.lang,
          items: data.events.map((event) => ({
            name: event.title,
            path: `/events/${event.slug}`,
          })),
        })}
      />
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground hover:underline">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span aria-current="page" className="text-foreground">
          {t("イベント・企画", "Events")}
        </span>
      </nav>
      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 via-fuchsia-500 to-violet-600 p-5 text-white shadow-md md:p-7">
        <div
          className="-right-12 -top-16 pointer-events-none absolute size-56 rounded-full bg-white/20 blur-3xl md:size-80"
          aria-hidden="true"
        />
        <div
          className="-bottom-20 -left-10 pointer-events-none absolute size-48 rounded-full bg-amber-300/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="flex items-center gap-2 font-black text-2xl tracking-tight md:text-4xl">
              <Sparkles className="size-6 md:size-8" aria-hidden="true" />
              {t("イベント・企画", "Events")}
            </h1>
            <p className="max-w-2xl text-sm text-white/90 leading-relaxed">
              {t(
                "テーマに合わせて描いて、タグを付けて投稿するだけ。みんなの作品と並んで、ランキングや入賞を目指そう。",
                "Create for the theme and post with the tag. Line up with everyone's art and aim for the ranking.",
              )}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                {t("開催中", "Ongoing")}
                <span className="font-black text-sm tabular-nums">
                  {data.ongoingSummary.ongoingEventCount.toLocaleString()}
                </span>
                {t("件", "")}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                {t("参加作品", "Entries")}
                <span className="font-black text-sm tabular-nums">
                  {data.ongoingSummary.ongoingEntryCount.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              asChild
              className="h-11 flex-1 rounded-full bg-white px-5 font-bold text-fuchsia-700 hover:bg-white/90 md:flex-none dark:bg-white dark:text-fuchsia-700 dark:hover:bg-white/90"
            >
              <Link to="/events/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("企画を作る", "Host an event")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 flex-1 rounded-full border-white/60 bg-white/10 px-5 font-bold text-white hover:bg-white/20 hover:text-white md:flex-none"
            >
              <Link to="/my/events">{t("マイイベント", "My events")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-2">
        <nav
          aria-label={t("開催状態", "Status")}
          className={appPillRowClassName}
        >
          {statusTabs.map((tab) => {
            const isActive = status === tab.value
            return (
              <Link
                key={tab.value}
                to={buildHref({ status: tab.value })}
                preventScrollReset
                aria-current={isActive ? "page" : undefined}
                className={cn(appPillTabClassName(isActive), "gap-1.5")}
              >
                {tab.icon}
                {tab.label}
                {tab.value === "ONGOING" &&
                  data.ongoingSummary.ongoingEventCount > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 font-black text-[11px] tabular-nums leading-5",
                        isActive
                          ? "bg-rose-500 text-white"
                          : "bg-rose-600 text-white",
                      )}
                    >
                      {data.ongoingSummary.ongoingEventCount}
                    </span>
                  )}
              </Link>
            )
          })}
        </nav>
        <div className={appPillRowClassName}>
          {kindChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              aria-pressed={kind === chip.value}
              onClick={() => setKind(chip.value)}
              className={cn(appFilterChipClassName(kind === chip.value), "h-9")}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <details
        className="group rounded-2xl border bg-card"
        open={hasActiveFilters}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("イベントを探す・並べ替え", "Search & sort")}
          {hasActiveFilters && (
            <span className="rounded-full bg-[#0077d9] px-2 py-0.5 text-white text-xs">
              {t("絞り込み中", "Filtered")}
            </span>
          )}
          <ChevronRight
            className="ml-auto size-4 text-muted-foreground transition group-open:rotate-90"
            aria-hidden="true"
          />
        </summary>
        <Form
          className="grid gap-3 border-t p-4 md:grid-cols-[1fr_170px_150px_auto]"
          method="get"
        >
          {status !== "ONGOING" && status !== "ALL" && (
            <input type="hidden" name="status" value={status} />
          )}
          {kind !== "all" && <input type="hidden" name="tab" value={kind} />}
          <Input
            name="q"
            aria-label={t("イベントを検索", "Search events")}
            defaultValue={data.filters.keyword}
            placeholder={t(
              "イベント名・主催者・説明・タグで検索",
              "Search by title, host, description, or tag",
            )}
            className="h-10 rounded-full px-4 text-base md:text-sm"
          />
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
            <option value="CASUAL">{t("ランキングなし", "No ranking")}</option>
          </select>
          <select
            name="sort"
            aria-label={t("並び順", "Sort")}
            defaultValue={data.filters.sort}
            className={selectClassName}
          >
            <option value="SCHEDULE">{t("おすすめ順", "Recommended")}</option>
            <option value="POPULAR">{t("人気順", "Popular")}</option>
            <option value="CLOSING_SOON">
              {t("締切が近い順", "Closing soon")}
            </option>
            <option value="NEWEST">{t("新着順", "Newest")}</option>
          </select>
          <div className="flex gap-2">
            <Button className="w-full rounded-full md:w-auto" type="submit">
              {t("検索", "Search")}
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full rounded-full md:w-auto"
            >
              <a href={location.pathname}>{t("リセット", "Reset")}</a>
            </Button>
          </div>
        </Form>
      </details>

      <section aria-labelledby="events-list-heading" className="space-y-4">
        <h2 id="events-list-heading" className="font-bold text-lg md:text-xl">
          {statusTitle}
          {data.filters.keyword && (
            <span className="ml-2 font-normal text-muted-foreground text-sm">
              「{data.filters.keyword}」
            </span>
          )}
        </h2>
        {events.length === 0 ? (
          <EmptyEvents status={status} buildHref={buildHref} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {featuredEvent && (
              <div className="sm:col-span-2 lg:col-span-3">
                <AppEventCard
                  appEvent={featuredEvent}
                  variant="featured"
                  isEager
                />
              </div>
            )}
            {restEvents.map((appEvent, index) => (
              <AppEventCard
                key={`${appEvent.isOfficial ? "official" : "user"}-${appEvent.id}`}
                appEvent={appEvent}
                isEager={!featuredEvent && index === 0}
              />
            ))}
            {status !== "ENDED" && <CreateEventCta />}
          </div>
        )}
      </section>

      {(data.hasPreviousPage || data.hasNextPage) && (
        <nav
          aria-label={t("ページ", "Pages")}
          className="flex flex-wrap items-center justify-center gap-2 py-2"
        >
          {data.hasPreviousPage && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={buildHref({ page: data.page - 1 })}>
                {t("前へ", "Prev")}
              </a>
            </Button>
          )}
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
                  className="size-10 rounded-full p-0"
                >
                  <a
                    aria-current={page === data.page ? "page" : undefined}
                    href={buildHref({ page })}
                  >
                    {page + 1}
                  </a>
                </Button>
              </div>
            )
          })}
          {data.hasNextPage && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={buildHref({ page: data.page + 1 })}>
                {t("次へ", "Next")}
              </a>
            </Button>
          )}
        </nav>
      )}
    </div>
  )
}

function EmptyEvents(props: {
  status: EventStatusTab
  buildHref: (next: { status?: EventStatusTab }) => string
}) {
  const t = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-4 py-12 text-center">
      <p className="text-muted-foreground text-sm">
        {props.status === "ONGOING"
          ? t(
              "いま開催中のイベントはありません。もうすぐ始まるイベントをのぞいてみよう。",
              "No events are running right now. Check the upcoming ones.",
            )
          : t(
              "条件に合うイベントは見つかりませんでした。",
              "No events matched.",
            )}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {props.status !== "UPCOMING" && (
          <Link
            to={props.buildHref({ status: "UPCOMING" })}
            className={appPillTabClassName(false)}
          >
            {t("もうすぐ始まるイベント", "Upcoming events")}
          </Link>
        )}
        <Link to="/events/new" className={appPillTabClassName(true)}>
          <Plus className="mr-1 size-4" aria-hidden="true" />
          {t("企画を作る", "Host an event")}
        </Link>
      </div>
    </div>
  )
}

function CreateEventCta() {
  const t = useTranslation()

  return (
    <Link
      to="/events/new"
      className="group flex h-full min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-card/50 p-5 text-center transition hover:border-fuchsia-400 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-violet-600 text-white">
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
      <span className="font-semibold text-fuchsia-700 text-sm group-hover:underline dark:text-fuchsia-300">
        {t("企画を作る →", "Create an event →")}
      </span>
    </Link>
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
      participantIcons {
        id
        name
        iconUrl
      }
      userId
      userName
      ratings
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
