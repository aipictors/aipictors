import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { RefreshCcwIcon } from "lucide-react"
import { EventSensitiveWorkListItemFragment } from "~/routes/($lang).r.events.$event._index/components/event-sensitive-work-list"
import { EventAwardPagingSensitiveWorkList } from "~/routes/($lang).events.$event.award._index/components/event-award-paging-sensitive-work-list"
import { Button } from "~/components/ui/button"
import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { config } from "~/config"

type Translate = (ja: string, en: string) => string

type EventSource = "OFFICIAL" | "USER"

type SensitiveAwardEvent = {
  id: string
  description: string
  title: string
  slug: string
  thumbnailImageUrl: string | null
  headerImageUrl: string | null
  startAt: number
  endAt: number
  tag: string
  worksCount: number
  awardWorks: React.ComponentProps<
    typeof EventAwardPagingSensitiveWorkList
  >["works"]
  eventSource: EventSource
}

const toEventDateTimeText = (t: Translate, time: number) => {
  // UTC時間から日本時間（UTC+9）に変換
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

const normalizeOfficialEvent = (event: any): SensitiveAwardEvent => ({
  id: event.id,
  description: event.description,
  title: event.title,
  slug: event.slug,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tag: event.tag,
  worksCount: event.worksCount ?? 0,
  awardWorks: event.awardWorks ?? [],
  eventSource: "OFFICIAL",
})

const normalizeUserEvent = (event: any): SensitiveAwardEvent => ({
  id: event.id,
  description: event.description,
  title: event.title,
  slug: event.slug,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tag: event.mainTag,
  worksCount: event.entryCount ?? event.worksCount ?? 0,
  awardWorks: event.awardWorks ?? [],
  eventSource: "USER",
})

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URLSearchParams(props.request.url.split("?")[1])
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const eventsResp = await loaderClient.query({
    query: appEventQuery,
    variables: {
      limit: 200,
      offset: 0,
      slug: event,
      isSensitive: true,
    },
  })

  const normalizedEvent = eventsResp.data.appEvent
    ? normalizeOfficialEvent(eventsResp.data.appEvent)
    : eventsResp.data.userEvent
      ? normalizeUserEvent(eventsResp.data.userEvent)
      : null

  if (normalizedEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    event: normalizedEvent,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()
  const navigate = useNavigate()

  if (data.event.awardWorks === null) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="mt-4 text-center font-medium text-lg">
            {data.event.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="m-auto flex max-w-96 flex-col items-center text-left">
            <div
              className="mb-2 text-left text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted CMS HTML
              dangerouslySetInnerHTML={{ __html: data.event.description }}
            />
            <div className="mr-auto text-sm">
              {toEventDateTimeText(t, data.event.startAt)}～
              {toEventDateTimeText(t, data.event.endAt)}
            </div>
            <div className="mt-2 mr-auto text-sm">
              応募作品数: {data.event.worksCount?.toString() ?? "0"}
            </div>
            <div className="mt-2 mr-auto text-sm">
              <span>参加タグ: {data.event.tag}</span>
            </div>
            <Button
              className="mt-4 flex w-40 cursor-pointer justify-center"
              variant={"secondary"}
              onClick={() => {
                navigate(`/events/${data.event.slug}`)
              }}
            >
              <RefreshCcwIcon className="mr-1 w-3" />
              <p className="text-sm">{"全年齢"}</p>
            </Button>
          </div>
        </CardContent>
      </Card>
      {data.event.slug && (
        <EventAwardPagingSensitiveWorkList
          works={data.event.awardWorks}
          maxCount={data.event.worksCount}
          page={data.page}
          slug={data.event.slug}
          eventSource={data.event.eventSource}
        />
      )}
    </div>
  )
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $isSensitive: Boolean!) {
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
      awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
        ...EventSensitiveWorkListItem
      }
    }
    userEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      mainTag
      entryCount
      worksCount
      awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
        ...EventSensitiveWorkListItem
      }
    }
  }`,
  [EventSensitiveWorkListItemFragment],
)
