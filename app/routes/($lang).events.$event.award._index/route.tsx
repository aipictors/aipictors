import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  EventAwardPagingWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event.award._index/components/event-award-paging-work-list"
import { Button } from "~/components/ui/button"
import { format } from "date-fns"
import { useTranslation } from "~/hooks/use-translation"
import type { LoaderFunctionArgs } from "react-router-dom"
import { config } from "~/config"
import type { HeadersFunction } from "@remix-run/cloudflare"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"

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

  const urlParams = new URL(props.request.url).searchParams

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
      // where: {
      //   ratings: ["G", "R15"],
      //   isNowCreatedAt: true,
      // },
      isSensitive: false,
    },
  })

  if (eventsResp.data.appEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    appEvent: eventsResp.data.appEvent,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <img
        className="h-auto w-full rounded-lg object-cover"
        src={data.appEvent.thumbnailImageUrl}
        alt=""
      />
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="mt-4 text-center font-medium text-lg">
            {data.appEvent.title}
          </div>
        </CardHeader>
        <CardContent>
          <div className="m-auto flex max-w-96 flex-col items-center text-left">
            {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
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
            {data.appEvent.slug !== null && (
              <SensitiveToggle
                variant="compact"
                targetUrl={`/r/events/${data.appEvent.slug}/award`}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Button
        onClick={() => {
          navigate(`/events/${data.appEvent.slug}`)
        }}
        className="m-auto w-full"
        variant={"secondary"}
        size={"sm"}
      >
        {"戻る"}
      </Button>
      {data.appEvent.awardWorks && data.appEvent.slug && (
        <EventAwardPagingWorkList
          works={data.appEvent.awardWorks}
          slug={data.appEvent.slug}
          maxCount={data.appEvent.worksCount}
          page={data.page}
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
        ...EventAwardWorkListItem
      }
    }
  }`,
  [EventAwardWorkListItemFragment],
)
