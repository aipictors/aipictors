import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  Form,
  type MetaFunction,
  useLoaderData,
  useLocation,
} from "@remix-run/react"
import {
  ChevronRight,
  Flame,
  History,
  LayoutGrid,
  Plus,
  Search,
  Timer,
  Users,
} from "lucide-react"
import type { ReactNode } from "react"
import {
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
import { createMeta } from "~/utils/create-meta"

const EVENTS_PAGE_LIMIT = 24

type SortType = "ONGOING_FIRST" | "POPULAR" | "CLOSING_SOON" | "NEWEST"

/** 開催状態のタブ（空文字はすべて） */
type StatusFilter = "" | "ONGOING" | "UPCOMING" | "ENDED"

const toStatusFilter = (value: string): StatusFilter =>
  value === "ONGOING" || value === "UPCOMING" || value === "ENDED" ? value : ""

const toSortType = (value: string | undefined): SortType =>
  value === "POPULAR" || value === "CLOSING_SOON" || value === "NEWEST"
    ? value
    : "ONGOING_FIRST"

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

const sortUserEvents = (events: EventCardItem[], sort: SortType) => {
  const copied = [...events]

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

  const getEventPriority = (status: string) => {
    if (status === "UPCOMING") return 1
    if (status === "ENDED") return 2
    return 0
  }

  // 開催中は締切が近い順、開催予定は始まる順、終了は新しく終わった順
  return copied.sort((a, b) => {
    const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status)
    if (priorityDiff !== 0) return priorityDiff

    if (a.status === "ENDED") {
      return b.endAt - a.endAt
    }

    if (a.status === "UPCOMING") {
      return a.startAt - b.startAt
    }

    return a.endAt - b.endAt
  })
}

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

const buildVisiblePages = (currentPage: number, hasNextPage: boolean) => {
  const pages = new Set<number>([0, currentPage])

  if (currentPage > 0) {
    pages.add(currentPage - 1)
  }

  if (hasNextPage) {
    pages.add(currentPage + 1)
  }

  return [...pages].filter((page) => page >= 0).sort((a, b) => a - b)
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.EVENTS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)

  const rawPage = Number(url.searchParams.get("page") ?? "0")
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0
  const keyword = url.searchParams.get("q")?.trim() ?? ""
  const status = toStatusFilter(url.searchParams.get("status")?.trim() ?? "")
  const rawRanking = url.searchParams.get("ranking")?.trim() ?? "ALL"
  const ranking =
    rawRanking === "RANKING" || rawRanking === "CASUAL" ? rawRanking : "ALL"
  const sort = toSortType(url.searchParams.get("sort")?.trim())

  const resp = await loaderClient.query({
    fetchPolicy: "no-cache",
    query: userEventsQuery,
    variables: {
      offset: page * EVENTS_PAGE_LIMIT,
      limit: EVENTS_PAGE_LIMIT,
      userEventWhere: {
        ...(keyword.length > 0 && { keyword }),
        ...(status.length > 0 && { status }),
        ...(ranking === "RANKING" && { rankingEnabled: true }),
        ...(ranking === "CASUAL" && { rankingEnabled: false }),
        sort,
      },
    },
  })

  const userIconMap = await buildUserEventIconMap(
    resp.data.userEvents.map((event: any) => event.userId).filter(Boolean),
  )

  const userEventsWithIcons = resp.data.userEvents.map((event: any) => ({
    ...event,
    userIconUrl: event.userId ? (userIconMap.get(event.userId) ?? null) : null,
  }))

  const userEvents = userEventsWithIcons.map(normalizeUserEvent)

  return {
    userEvents: sortUserEvents(userEvents, sort),
    page,
    hasPreviousPage: page > 0,
    hasNextPage: resp.data.userEvents.length === EVENTS_PAGE_LIMIT,
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

export default function EventsUserEventsIndexRoute() {
  const data = useLoaderData<typeof loader>()

  const location = useLocation()

  const t = useTranslation()

  const status = data.filters.status

  const hasActiveFilters =
    data.filters.keyword.length > 0 ||
    data.filters.ranking !== "ALL" ||
    data.filters.sort !== "ONGOING_FIRST"

  const buildHref = (next: { status?: StatusFilter; page?: number }) => {
    const params = new URLSearchParams()
    const nextStatus = next.status ?? status

    if (data.filters.keyword) {
      params.set("q", data.filters.keyword)
    }

    if (nextStatus) {
      params.set("status", nextStatus)
    }

    if (data.filters.ranking && data.filters.ranking !== "ALL") {
      params.set("ranking", data.filters.ranking)
    }

    if (data.filters.sort && data.filters.sort !== "ONGOING_FIRST") {
      params.set("sort", data.filters.sort)
    }

    const page = next.page ?? 0
    if (page > 0) {
      params.set("page", String(page))
    }

    // "." だと /events を指してしまうので、いまのパスに付ける
    const query = params.toString()
    return query.length > 0
      ? `${location.pathname}?${query}`
      : location.pathname
  }

  const statusTabs: Array<{
    value: StatusFilter
    label: string
    icon: ReactNode
  }> = [
    {
      value: "",
      label: t("すべて", "All"),
      icon: <LayoutGrid className="size-4" aria-hidden="true" />,
    },
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

  const events = data.userEvents

  // 「すべて」をおすすめ順で見ているときは、開催中・もうすぐ・終了に分けて見出しを付ける
  const isGrouped = status === "" && data.filters.sort === "ONGOING_FIRST"

  const ongoingEvents = events.filter((event) => event.status === "ONGOING")
  const upcomingEvents = events.filter((event) => event.status === "UPCOMING")
  const endedEvents = events.filter(
    (event) => event.status !== "ONGOING" && event.status !== "UPCOMING",
  )

  const selectClassName =
    "h-10 rounded-full border bg-background px-4 py-2 text-sm"

  const visiblePages = buildVisiblePages(data.page, data.hasNextPage)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:gap-5">
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground hover:underline">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link to="/events" className="hover:text-foreground hover:underline">
          {t("イベント・企画", "Events")}
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span aria-current="page" className="text-foreground">
          {t("ユーザー企画", "User events")}
        </span>
      </nav>

      <header className="flex flex-col gap-4 rounded-3xl border bg-linear-to-br from-violet-50 to-fuchsia-50 p-4 md:flex-row md:items-end md:justify-between md:p-6 dark:from-violet-950/40 dark:to-fuchsia-950/30">
        <div className="min-w-0 space-y-1.5">
          <h1 className="flex items-center gap-2 font-black text-2xl tracking-tight md:text-3xl">
            <Users
              className="size-6 text-violet-700 md:size-7 dark:text-violet-300"
              aria-hidden="true"
            />
            {t("ユーザー企画", "User events")}
          </h1>
          <p className="max-w-2xl text-muted-foreground text-xs leading-relaxed sm:text-sm">
            {t(
              "ユーザーが主催する投稿企画の一覧です。テーマに合わせて描いて、企画のタグを付けて投稿すると参加できます。",
              "Art events hosted by users. Create for the theme and post with the event tag to join.",
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            asChild
            className="h-11 flex-1 rounded-full bg-violet-700 px-5 font-bold text-white hover:bg-violet-800 md:flex-none dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            <Link to="/events/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("企画を作る", "Host an event")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 flex-1 rounded-full px-5 font-bold md:flex-none"
          >
            <Link to="/my/events">{t("マイイベント", "My events")}</Link>
          </Button>
        </div>
      </header>

      <nav aria-label={t("開催状態", "Status")} className={appPillRowClassName}>
        {statusTabs.map((tab) => {
          const isActive = status === tab.value
          return (
            <Link
              key={tab.value || "ALL"}
              to={buildHref({ status: tab.value })}
              preventScrollReset
              aria-current={isActive ? "page" : undefined}
              className={cn(appPillTabClassName(isActive), "gap-1.5")}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <details
        className="group rounded-2xl border bg-card"
        open={hasActiveFilters}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          {t("企画を探す・並べ替え", "Search & sort")}
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
          {status && <input type="hidden" name="status" value={status} />}
          <Input
            name="q"
            aria-label={t("企画を検索", "Search events")}
            defaultValue={data.filters.keyword}
            placeholder={t(
              "企画名・説明・タグで検索",
              "Search by title, description, or tag",
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
            <option value="ONGOING_FIRST">
              {t("おすすめ順", "Recommended")}
            </option>
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

      {data.filters.keyword && (
        <p className="text-muted-foreground text-sm">
          {t(
            `「${data.filters.keyword}」の検索結果`,
            `Results for "${data.filters.keyword}"`,
          )}
        </p>
      )}

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-4 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            {t(
              "条件に一致する企画は見つかりませんでした。別のキーワードや状態でお試しください。",
              "No events matched your filters. Try a different keyword or status.",
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(status !== "" || hasActiveFilters) && (
              <Link
                to={location.pathname}
                className={appPillTabClassName(false)}
              >
                {t("すべての企画を見る", "See all events")}
              </Link>
            )}
            <Link to="/events/new" className={appPillTabClassName(true)}>
              <Plus className="mr-1 size-4" aria-hidden="true" />
              {t("企画を作る", "Host an event")}
            </Link>
          </div>
        </div>
      ) : isGrouped ? (
        <div className="space-y-8">
          {ongoingEvents.length > 0 && (
            <EventSection
              title={t("開催中", "Ongoing")}
              count={ongoingEvents.length}
              tone="ongoing"
            >
              <EventGrid
                events={ongoingEvents}
                eagerFirst
                trailing={
                  data.page === 0 && upcomingEvents.length === 0 ? (
                    <CreateEventCta />
                  ) : null
                }
              />
            </EventSection>
          )}
          {upcomingEvents.length > 0 && (
            <EventSection
              title={t("もうすぐ始まる", "Coming soon")}
              count={upcomingEvents.length}
              tone="upcoming"
            >
              <EventGrid
                events={upcomingEvents}
                eagerFirst={ongoingEvents.length === 0}
                trailing={data.page === 0 ? <CreateEventCta /> : null}
              />
            </EventSection>
          )}
          {data.page === 0 &&
            ongoingEvents.length === 0 &&
            upcomingEvents.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <CreateEventCta />
              </div>
            )}
          {endedEvents.length > 0 && (
            <EventSection
              title={t("終了した企画", "Past events")}
              count={endedEvents.length}
              tone="ended"
            >
              <CompactEventGrid events={endedEvents} />
            </EventSection>
          )}
        </div>
      ) : status === "ENDED" ? (
        <CompactEventGrid events={events} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {events.map((appEvent, index) =>
            appEvent.status === "ENDED" ? (
              <AppEventCard
                key={appEvent.id}
                appEvent={appEvent}
                variant="compact"
              />
            ) : (
              <AppEventCard
                key={appEvent.id}
                appEvent={appEvent}
                isEager={index === 0}
              />
            ),
          )}
          {data.page === 0 && <CreateEventCta />}
        </div>
      )}

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

function EventSection(props: {
  title: string
  count: number
  tone: "ongoing" | "upcoming" | "ended"
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-bold text-lg md:text-xl">
        <span
          className={cn(
            "size-2.5 rounded-full",
            props.tone === "ongoing"
              ? "bg-rose-600"
              : props.tone === "upcoming"
                ? "bg-sky-700"
                : "bg-slate-500",
          )}
          aria-hidden="true"
        />
        {props.title}
        <span className="font-normal text-muted-foreground text-sm tabular-nums">
          {props.count}
        </span>
      </h2>
      {props.children}
    </section>
  )
}

function EventGrid(props: {
  events: EventCardItem[]
  eagerFirst?: boolean
  /** 最後に並べるもの（企画を作るカード） */
  trailing?: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {props.events.map((appEvent, index) => (
        <AppEventCard
          key={appEvent.id}
          appEvent={appEvent}
          isEager={props.eagerFirst === true && index === 0}
        />
      ))}
      {props.trailing}
    </div>
  )
}

/** 終了した企画は小さめのカードを詰めて並べる */
function CompactEventGrid(props: { events: EventCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {props.events.map((appEvent) => (
        <AppEventCard key={appEvent.id} appEvent={appEvent} variant="compact" />
      ))}
    </div>
  )
}

function CreateEventCta() {
  const t = useTranslation()

  return (
    <Link
      to="/events/new"
      className="group flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed bg-card/50 p-5 text-center transition hover:border-violet-400 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-violet-600 text-white">
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
      <span className="font-semibold text-sm text-violet-700 group-hover:underline dark:text-violet-300">
        {t("企画を作る →", "Create an event →")}
      </span>
    </Link>
  )
}

const userEventsQuery = gql`
  query UserEventsIndex($limit: Int!, $offset: Int!, $userEventWhere: UserEventsWhereInput) {
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

const eventUserIconQuery = gql`
  query EventUserIcon($userId: ID!) {
    user(id: $userId) {
      id
      iconUrl
    }
  }
`
