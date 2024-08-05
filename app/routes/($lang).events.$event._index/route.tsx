import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { createClient } from "~/lib/client"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { EventWorkList } from "~/routes/($lang).events.$event._index/components/event-work-list"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { RefreshCcwIcon } from "lucide-react"
import { EventAwardWorkList } from "~/routes/($lang).events.$event._index/components/event-award-work-list"

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URL(props.request.url).searchParams
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  if (event === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const eventsResp = await client.query({
    query: appEventQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      slug: event,
      where: {
        ratings: ["G", "R15"],
        isNowCreatedAt: true,
      },
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
    !data.appEvent.awardWorks ||
    !data.appEvent.works
  ) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4">
      <img
        className="h-auto max-h-40 w-full rounded-lg object-cover"
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
            <div className="mb-2 text-left text-sm ">
              {data.appEvent.description}
            </div>
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
                  "センシティブ作品を表示します。あなたは18歳以上ですか？"
                }
                onNext={() => {
                  navigate(`/sensitive/events/${data.appEvent.slug}`)
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
      {data.appEvent.awardWorks && data.appEvent.slug && (
        <EventAwardWorkList
          works={data.appEvent.awardWorks}
          slug={data.appEvent.slug}
          isSensitive={false}
        />
      )}
      <h2 className="font-bold text-md">{"作品一覧"}</h2>
      {data.appEvent.slug && (
        <EventWorkList
          works={data.appEvent.works}
          isSensitive={false}
          maxCount={data.appEvent.worksCount as number}
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
        ...PartialWorkFields
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
