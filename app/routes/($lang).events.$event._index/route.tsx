import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { createClient } from "~/lib/client"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { EventWorkList } from "~/routes/($lang).events.$event._index/components/event-work-list"

export async function loader(props: LoaderFunctionArgs) {
  const event = props.params.event

  const urlParams = new URLSearchParams(props.request.url.split("?")[1])
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
      },
      isSensitive: false,
    },
  })

  if (eventsResp.data.appEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    appEvent: eventsResp.data.appEvent,
    works: eventsResp.data.appEvent.works,
    worksCount: eventsResp.data.appEvent.worksCount as number,
    awardWorks: eventsResp.data.appEvent.awardWorks,
    page,
  })
}

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  // const authContext = useContext(AuthContext)

  const navigate = useNavigate()

  // TODO: コンポーネントが不足している
  // if (!authContext.isLoggedIn) {
  //   return null
  // }

  // TODO: コンポーネントが不足している
  if (
    !data.appEvent?.title ||
    !data.appEvent?.thumbnailImageUrl ||
    !data.appEvent?.tag ||
    !data.appEvent?.description ||
    !data.appEvent?.startAt ||
    !data.appEvent?.endAt ||
    !data.appEvent.worksCount ||
    !data.appEvent.awardWorks ||
    !data.works
  ) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Card className="m-auto w-full">
        <CardHeader>
          <div className="flex flex-col items-center">
            <img
              className="h-auto max-w-96 rounded-lg object-cover"
              src={data.appEvent.thumbnailImageUrl}
              alt=""
            />
            <div className="mt-4 font-medium text-lg">
              {data.appEvent.title}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="mb-2 text-sm">{data.appEvent.description}</div>
            <div className="text-sm">
              {toDateTimeText(data.appEvent.startAt)}～
              {toDateTimeText(data.appEvent.endAt)}
            </div>
            <div className="mt-2 text-sm">
              <span>
                応募作品数: {data.appEvent.worksCount?.toString() ?? "0"}
              </span>
            </div>
            <div className="mt-2 text-sm">
              <span>参加タグ: {data.appEvent.tag}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {data.appEvent.slug && (
        <EventWorkList
          works={data.works}
          isSensitive={false}
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
        ...PartialWorkFields
      }
      awardWorks(offset: 0, limit: 20, isSensitive: $isSensitive) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
