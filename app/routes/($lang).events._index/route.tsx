import { AuthContext } from "~/contexts/auth-context"
import { createClient } from "~/lib/client"
import { EventsList } from "~/routes/($lang).events._index/components/events-list"
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  const client = createClient()

  const urlParams = new URLSearchParams(props.request.url.split("?")[1])
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  const eventsResp = await client.query({
    query: appEventsQuery,
    variables: {
      offset: page * 16,
      limit: 16,
    },
  })

  if (eventsResp.data.appEvents === null) {
    throw new Response(null, { status: 404 })
  }

  return json({
    appEvents: eventsResp.data.appEvents,
  })
}

export default function FollowingLayout() {
  const authContext = useContext(AuthContext)

  const events = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        AIイラスト - 開催イベント一覧
      </h1>
      <EventsList appEvents={events.appEvents} />
    </>
  )
}

const appEventsQuery = graphql(
  `query AppEvents( $limit: Int!, $offset: Int!, $where: AppEventsWhereInput) {
    appEvents(limit: $limit, offset: $offset, where: $where) {
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
