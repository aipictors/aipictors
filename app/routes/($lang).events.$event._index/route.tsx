import { ResponsivePagination } from "@/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "@/components/responsive-photo-works-album"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { AuthContext } from "@/contexts/auth-context"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { createClient } from "@/lib/client"
import { toDateTimeText } from "@/utils/to-date-time-text"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"

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
      slug: event,
    },
  })

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      limit: 64,
      offset: page * 64,
      where: {
        tagNames: [eventsResp.data.appEvent?.tag ?? ""],
      },
    },
  })

  const worksCount = await client.query({
    query: worksCountQuery,
    variables: {
      where: {
        tagNames: [eventsResp.data.appEvent?.tag ?? ""],
      },
    },
  })

  if (eventsResp.data.appEvent === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    appEvent: eventsResp.data.appEvent,
    works: worksResp.data.works,
    worksCount: worksCount.data.worksCount,
    page,
  })
}

export default function FollowingLayout() {
  const data = useLoaderData<typeof loader>()

  const authContext = useContext(AuthContext)

  const navigate = useNavigate()

  // TODO: コンポーネントが不足している
  if (!authContext.isLoggedIn) {
    return null
  }

  // TODO: コンポーネントが不足している
  if (
    !data.appEvent?.title ||
    !data.appEvent?.thumbnailImageUrl ||
    !data.appEvent?.tag ||
    !data.appEvent?.description ||
    !data.appEvent?.startAt ||
    !data.appEvent?.endAt
  ) {
    return null
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <Card className="m-auto max-w-96">
        <CardHeader>
          <div className="flex flex-col items-center">
            <img
              className="h-auto w-full rounded-lg object-cover"
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
              <span>応募作品数: {data.worksCount}</span>
            </div>
            <div className="mt-2 text-sm">
              <span>参加タグ: {data.appEvent.tag}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <ResponsivePhotoWorksAlbum works={data.works} />
      <ResponsivePagination
        maxCount={data.worksCount}
        perPage={64}
        currentPage={data.page}
        onPageChange={(page: number) => {
          navigate(`/events/${data.appEvent?.slug}?page=${page}`)
        }}
      />
    </div>
  )
}

const appEventQuery = graphql(
  `query AppEvent($slug: String!) {
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
    }
  }`,
)

/**
 * TODO_2024_08: クエリを統合する
 */
const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

/**
 * TODO_2024_08: クエリを統合する
 */
const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
