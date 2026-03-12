import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Form, Link, type MetaFunction, useLoaderData } from "@remix-run/react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "~/components/ui/badge"
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

const sortEvents = (events: EventCardItem[], sort: string) => {
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

function FeaturedEventRotator(props: { events: EventCardItem[] }) {
  const t = useTranslation()

  const shuffledEvents = useMemo(() => shuffleEvents(props.events), [props.events])

  const [currentIndex, setCurrentIndex] = useState(0)

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

  const event = shuffledEvents[currentIndex]

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Link to={`/events/${event.slug}`} className="group block">
        <div className="relative">
          <img
            src={event.thumbnailImageUrl}
            alt={event.title}
            className="h-44 w-full object-cover md:h-56"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <div className="max-w-3xl space-y-2 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-transparent bg-white/90 text-black hover:bg-white/90">
                  {event.status === "ONGOING"
                    ? t("開催中", "Ongoing")
                    : t("開催予定", "Upcoming")}
                </Badge>
                <Badge variant="secondary" className="bg-black/35 text-white backdrop-blur-sm">
                  {event.isOfficial
                    ? t("公式イベント", "Official event")
                    : t("ユーザー企画", "User event")}
                </Badge>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-xl leading-tight md:text-2xl">
                  {event.title}
                </h2>
                <p className="line-clamp-1 text-sm text-white/80 md:text-base">
                  {event.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <span className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
                  {t("作品", "Entries")}: {event.entryCount}
                </span>
                <span className="rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
                  {event.status === "ONGOING"
                    ? t("公開中", "Live now")
                    : t("まもなく開始", "Starts soon")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {shuffledEvents.length > 1 && (
        <div className="flex items-center justify-center gap-2 bg-card px-4 py-3">
          {shuffledEvents.map((rotatorEvent, index) => (
            <button
              key={rotatorEvent.id}
              type="button"
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-foreground"
                  : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
              aria-label={t("{{count}}件目のイベントを表示", "Show event {{count}}").replace(
                "{{count}}",
                String(index + 1),
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function EventListSection(props: EventListSectionProps) {
  const t = useTranslation()

  const statusCounts = countEventsByStatus(props.events)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-red-500 text-white hover:bg-red-500/90">
          {t("開催中", "Ongoing")} ({statusCounts.ongoing})
        </Badge>
        <Badge className="bg-sky-500 text-white hover:bg-sky-500/90">
          {t("開催予定", "Upcoming")} ({statusCounts.upcoming})
        </Badge>
        <Badge variant="secondary">
          {t("終了", "Ended")} ({statusCounts.ended})
        </Badge>
      </div>
      <div className="grid gap-2 rounded-lg md:grid-cols-2 xl:grid-cols-3">
        {props.events.map((appEvent) => (
          <div key={appEvent.id}>
            <AppEventCard appEvent={appEvent} />
          </div>
        ))}
      </div>
      {props.events.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
          {t(
            "条件に一致するイベントは見つかりませんでした。別のキーワードや状態でお試しください。",
            "No events matched your filters. Try a different keyword or status.",
          )}
        </div>
      )}
    </div>
  )
}

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  const urlParams = new URLSearchParams(props.request.url.split("?")[1])

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  const keyword = urlParams.get("q")?.trim() ?? ""

  const status = urlParams.get("status")?.trim() ?? ""

  const ranking = urlParams.get("ranking")?.trim() ?? "ALL"

  const sort = urlParams.get("sort")?.trim() ?? "ONGOING_FIRST"

  const resp = await loaderClient.query({
    query: eventsQuery,
    variables: {
      offset: page * 16,
      limit: 16,
      appEventWhere: {
        ...(keyword.length > 0 && { keyword }),
        ...(status.length > 0 && { status }),
      },
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
    userIconUrl: event.userId ? userIconMap.get(event.userId) ?? null : null,
  }))

  const mergedEvents = [
    ...resp.data.appEvents.map(normalizeOfficialEvent),
    ...userEventsWithIcons.map(normalizeUserEvent),
  ]

  return {
    appEvents: sortEvents(mergedEvents, sort),
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

  const officialEvents = data.appEvents.filter((event) => event.isOfficial)

  const userEvents = data.appEvents.filter((event) => !event.isOfficial)

  const featuredEvents = data.appEvents.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING",
  )

  const defaultTab = officialEvents.length > 0 ? "official" : "user"

  if (data === null) {
    return null
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        {t("AIイラスト - 開催イベント一覧", "AI Illustration - Event List")}
      </h1>
      <div className="mt-4 flex flex-col space-y-4">
        <FeaturedEventRotator events={featuredEvents} />
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="/events/new">{t("イベントを作成", "Create event")}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/my/events">{t("マイイベント管理", "Manage my events")}</a>
          </Button>
        </div>
        <Form
          className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_180px_auto]"
          method="get"
        >
          <Input
            name="q"
            defaultValue={data.filters.keyword}
            placeholder={t(
              "イベント名・説明・タグで検索",
              "Search by event title, description, or tag",
            )}
          />
          <select
            name="status"
            defaultValue={data.filters.status}
            className="h-10 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("すべての状態", "All statuses")}</option>
            <option value="ONGOING">{t("開催中", "Ongoing")}</option>
            <option value="UPCOMING">{t("開催予定", "Upcoming")}</option>
            <option value="ENDED">{t("終了", "Ended")}</option>
          </select>
          <select
            name="ranking"
            defaultValue={data.filters.ranking}
            className="h-10 rounded-md border bg-background px-3 py-2 text-sm"
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
            defaultValue={data.filters.sort}
            className="h-10 rounded-md border bg-background px-3 py-2 text-sm"
          >
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
            <Button className="w-full md:w-auto" type="submit">
              {t("検索", "Search")}
            </Button>
            <Button asChild variant="secondary" className="w-full md:w-auto">
              <a href=".">{t("リセット", "Reset")}</a>
            </Button>
          </div>
        </Form>
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="official" className="min-w-fit">
              {t("公式イベント", "Official events")} ({officialEvents.length})
            </TabsTrigger>
            <TabsTrigger value="user" className="min-w-fit">
              {t("ユーザー企画", "User events")} ({userEvents.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="official" className="m-0">
            <EventListSection events={officialEvents} />
          </TabsContent>
          <TabsContent value="user" className="m-0">
            <EventListSection events={userEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </>
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

const eventUserIconQuery = gql`
  query EventUserIcon($userId: ID!) {
    user(id: $userId) {
      id
      iconUrl
    }
  }
`
