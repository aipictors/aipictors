import { gql } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Form, type MetaFunction, useLoaderData } from "@remix-run/react"
import { useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  AppEventCard,
  type EventCardItem,
} from "~/routes/($lang).events._index/components/app-event-card"
import { createMeta } from "~/utils/create-meta"

const EVENTS_PAGE_LIMIT = 24

type SortType = "ONGOING_FIRST" | "POPULAR" | "CLOSING_SOON" | "NEWEST"

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

  return copied.sort((a, b) => {
    const priorityDiff = getEventPriority(a.status) - getEventPriority(b.status)
    if (priorityDiff !== 0) return priorityDiff

    if (a.status === "ENDED") {
      return b.endAt - a.endAt
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

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)

  const rawPage = Number(url.searchParams.get("page") ?? "0")
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0
  const keyword = url.searchParams.get("q")?.trim() ?? ""
  const status = url.searchParams.get("status")?.trim() ?? ""
  const ranking = url.searchParams.get("ranking")?.trim() ?? "ALL"
  const sort = (url.searchParams.get("sort")?.trim() ??
    "ONGOING_FIRST") as SortType

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
  const t = useTranslation()

  const title = useMemo(() => t("ユーザー主催投稿企画一覧", "User events"), [t])

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

    if (data.filters.sort && data.filters.sort !== "ONGOING_FIRST") {
      params.set("sort", data.filters.sort)
    }

    if (page > 0) {
      params.set("page", String(page))
    }

    const query = params.toString()
    return query.length > 0 ? `?${query}` : "."
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">{title}</h1>

      <div className="mt-4 flex flex-col space-y-4">
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

        <div className="grid gap-2 rounded-lg md:grid-cols-2 xl:grid-cols-3">
          {data.userEvents.map((appEvent) => (
            <div key={appEvent.id}>
              <AppEventCard appEvent={appEvent} />
            </div>
          ))}
        </div>

        {data.userEvents.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            {t(
              "条件に一致するイベントは見つかりませんでした。別のキーワードや状態でお試しください。",
              "No events matched your filters. Try a different keyword or status.",
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <div className="text-muted-foreground text-sm">
            {t("ページ", "Page")} {data.page + 1}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" disabled={!data.hasPreviousPage}>
              <a
                aria-disabled={!data.hasPreviousPage}
                href={data.hasPreviousPage ? buildPageHref(data.page - 1) : undefined}
              >
                {t("前へ", "Prev")}
              </a>
            </Button>
            <Button asChild variant="secondary" disabled={!data.hasNextPage}>
              <a
                aria-disabled={!data.hasNextPage}
                href={data.hasNextPage ? buildPageHref(data.page + 1) : undefined}
              >
                {t("次へ", "Next")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
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
