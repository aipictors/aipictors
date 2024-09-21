import { AuthContext } from "~/contexts/auth-context"
import { loaderClient } from "~/lib/loader-client"
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
import { useTranslation } from "~/hooks/use-translation"

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  const urlParams = new URLSearchParams(props.request.url.split("?")[1])
  const pageParam = urlParams.get("page")
  const page = pageParam ? Number(pageParam) : 0

  const eventsResp = await loaderClient.query({
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

  const t = useTranslation()

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        {t("AIイラスト - 開催イベント一覧", "AI Illustration - Event List")}
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
