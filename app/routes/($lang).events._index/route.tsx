import { gql } from "@apollo/client/index"
import { loaderClient } from "~/lib/loader-client"
import { Form, type MetaFunction, useLoaderData } from "@remix-run/react"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  AppEventCard,
  type EventCardItem,
} from "~/routes/($lang).events._index/components/app-event-card"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"

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
  userName: event.userName,
})

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

  const mergedEvents = [
    ...resp.data.appEvents.map(normalizeOfficialEvent),
    ...resp.data.userEvents.map(normalizeUserEvent),
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

export default function FollowingLayout () {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        {t("AIイラスト - 開催イベント一覧", "AI Illustration - Event List")}
      </h1>
      <p className="mx-auto max-w-3xl text-center text-muted-foreground text-sm">
        {t(
          "公式イベントとユーザー企画をまとめて検索できます。イベントページからそのまま投稿画面に進み、参加タグを付けて投稿できます。",
          "Browse both official and user-created events. From each event page, you can jump straight to the posting screen with the participation tag.",
        )}
      </p>
      <div className="mt-4 flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="/events/new">{t("イベントを作成", "Create event")}</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/my/events">{t("マイイベント管理", "Manage my events")}</a>
          </Button>
        </div>
        <Form className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_180px_auto]" method="get">
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
            <option value="ALL">{t("ランキング条件すべて", "All ranking types")}</option>
            <option value="RANKING">{t("ランキングあり", "Ranking enabled")}</option>
            <option value="CASUAL">{t("ランキングなし", "No ranking")}</option>
          </select>
          <select
            name="sort"
            defaultValue={data.filters.sort}
            className="h-10 rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="ONGOING_FIRST">{t("開催中優先", "Ongoing first")}</option>
            <option value="POPULAR">{t("人気順", "Popular")}</option>
            <option value="CLOSING_SOON">{t("締切が近い順", "Closing soon")}</option>
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
          {data.appEvents.map((appEvent) => (
            <div key={appEvent.id}>
              <AppEventCard appEvent={appEvent} />
            </div>
          ))}
        </div>
        {data.appEvents.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
            {t(
              "条件に一致するイベントは見つかりませんでした。別のキーワードや状態でお試しください。",
              "No events matched your filters. Try a different keyword or status.",
            )}
          </div>
        )}
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
