import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { RefreshCcwIcon } from "lucide-react"
import {
  EventAwardPagingWorkList,
  EventAwardWorkListItemFragment,
} from "~/routes/($lang).events.$event.award._index/components/event-award-paging-work-list"
import { Button } from "~/components/ui/button"

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

  return json({
    appEvent: eventsResp.data.appEvent,
    page,
  })
}

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  if (
    !data.appEvent?.title ||
    !data.appEvent?.thumbnailImageUrl ||
    !data.appEvent?.tag ||
    !data.appEvent?.description ||
    !data.appEvent?.startAt ||
    !data.appEvent?.endAt ||
    !data.appEvent.worksCount ||
    !data.appEvent.awardWorks
  ) {
    return null
  }

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
            ></div>
            <div className="mr-auto text-sm">
              {toDateTimeText(data.appEvent.startAt)}～
              {toDateTimeText(data.appEvent.endAt)}
            </div>
            <div className="mt-2 mr-auto text-sm">
              応募作品数: {data.appEvent.worksCount?.toString() ?? "0"}
            </div>
            <div className="mt-2 mr-auto text-sm">
              <span>参加タグ: {data.appEvent.tag}</span>
            </div>
            {data.appEvent.slug !== null && (
              <AppConfirmDialog
                title={"確認"}
                description={
                  "センシティブ版を表示します。あなたは18歳以上ですか？"
                }
                onNext={() => {
                  navigate(`/r/events/${data.appEvent.slug}`)
                }}
                cookieKey={"check-sensitive-ranking"}
                onCancel={() => {}}
              >
                <div className="mt-4 flex w-40 cursor-pointer justify-center">
                  <RefreshCcwIcon className="mr-1 w-3" />
                  <p className="text-sm">{"対象年齢"}</p>
                </div>
              </AppConfirmDialog>
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
          isSensitive={false}
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
