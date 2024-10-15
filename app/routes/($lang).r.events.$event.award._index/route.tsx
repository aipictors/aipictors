import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { RefreshCcwIcon } from "lucide-react"
import {
  EventSensitiveWorkList,
  EventSensitiveWorkListItemFragment,
} from "~/routes/($lang).r.events.$event._index/components/event-sensitive-work-list"
import { Button } from "~/components/ui/button"
import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { config } from "~/config"

const toEventDateTimeText = (time: number) => {
  const t = useTranslation()

  // UTC時間から日本時間（UTC+9）に変換
  const date = new Date(time * 1000)
  const japanTime = new Date(date.getTime() - 9 * 60 * 60 * 1000)

  return t(
    format(japanTime, "yyyy年MM月dd日 HH時mm分"),
    format(japanTime, "yyyy/MM/dd HH:mm"),
  )
}

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
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: ["R18", "R18G"],
        isNowCreatedAt: true,
      },
      isSensitive: true,
    },
  })

  if (eventsResp.data.appEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    appEvent: eventsResp.data.appEvent,
    works: eventsResp.data.appEvent.works,
    worksCount: eventsResp.data.appEvent.worksCount as number,
    awardWorks: eventsResp.data.appEvent.awardWorks,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  if (!("works" in data) || data.works === null) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="mt-4 text-center font-medium text-lg">
            {data.appEvent.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="m-auto flex max-w-96 flex-col items-center text-left">
            <div
              className="mb-2 text-left text-sm"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: data.appEvent.description }}
            />
            <div className="mr-auto text-sm">
              {toEventDateTimeText(data.appEvent.startAt)}～
              {toEventDateTimeText(data.appEvent.endAt)}
            </div>
            <div className="mt-2 mr-auto text-sm">
              応募作品数: {data.appEvent.worksCount?.toString() ?? "0"}
            </div>
            <div className="mt-2 mr-auto text-sm">
              <span>参加タグ: {data.appEvent.tag}</span>
            </div>
            <Button
              className="mt-4 flex w-40 cursor-pointer justify-center"
              variant={"secondary"}
              onClick={() => {
                navigate(`/events/${data.appEvent.slug}`)
              }}
            >
              <RefreshCcwIcon className="mr-1 w-3" />
              <p className="text-sm">{"全年齢"}</p>
            </Button>
          </div>
        </CardContent>
      </Card>
      {data.appEvent.slug && (
        <EventSensitiveWorkList
          works={data.works}
          maxCount={data.worksCount}
          page={data.page}
          slug={data.appEvent.slug}
        />
      )}
    </div>
  )
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!, $isSensitive: Boolean!) {
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
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventSensitiveWorkListItem
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...EventSensitiveWorkListItem
      }
    }
  }`,
  [EventSensitiveWorkListItemFragment],
)
