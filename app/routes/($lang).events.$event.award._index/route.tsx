import type { HeadersFunction } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { format } from "date-fns"
import { graphql } from "gql.tada"
import type { LoaderFunctionArgs } from "react-router-dom"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  EventAwardPagingWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event.award._index/components/event-award-paging-work-list"

type EventSource = "OFFICIAL" | "USER"

type AwardPageEvent = {
  id: string
  title: string
  description: string
  slug: string
  thumbnailImageUrl: string
  headerImageUrl: string
  startAt: number
  endAt: number
  tag: string
  worksCount: number
  awardWorks: any[]
  eventSource: EventSource
}

const toEventDateTimeText = (t: ReturnType<typeof useTranslation>, time: number) => {

  // UTC時間から日本時間（UTC+9）に変換
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

const normalizeOfficialEvent = (event: any): AwardPageEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
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

const normalizeUserEvent = (event: any): AwardPageEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
  slug: event.slug,
  thumbnailImageUrl: event.thumbnailImageUrl,
  headerImageUrl: event.headerImageUrl,
  startAt: event.startAt,
  endAt: event.endAt,
  tag: event.mainTag,
  worksCount: event.worksCount ?? 0,
  awardWorks: event.awardWorks ?? [],
  eventSource: "USER",
})

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URL(props.request.url).searchParams

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const eventsResp = await loaderClient.query<any, any>({
    query: eventAwardPageQuery as any,
    variables: {
      limit: 200,
      offset: 0,
      slug: event,
      isSensitive: false,
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
  "Cache-Control": config.cacheControl.oneDay,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <img
        className="h-auto w-full rounded-lg object-cover"
        src={data.event.thumbnailImageUrl}
        alt=""
      />
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
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from serialized/trusted data
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
            {data.event.slug !== null && (
              <SensitiveToggle
                variant="compact"
                targetUrl={`/r/events/${data.event.slug}/award`}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Button
        onClick={() => {
          navigate(`/events/${data.event.slug}`)
        }}
        className="m-auto w-full"
        variant={"secondary"}
        size={"sm"}
      >
        {"戻る"}
      </Button>
      {data.event.awardWorks && data.event.slug && (
        <EventAwardPagingWorkList
          works={data.event.awardWorks}
          slug={data.event.slug}
          maxCount={data.event.worksCount}
          page={data.page}
          eventSource={data.event.eventSource}
        />
      )}
    </div>
  )
}

const eventAwardPageQuery = graphql(
  `query EventAwardPage($slug: String!, $offset: Int!, $limit: Int!, $isSensitive: Boolean!) {
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
        ...EventAwardWorkListItem
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
      worksCount
      awardWorks(offset: $offset, limit: $limit, isSensitive: $isSensitive) {
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment],
)
