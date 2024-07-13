import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { createClient } from "@/_lib/client"
import { EventsList } from "@/routes/($lang).events._index/_components/events-list"
import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Suspense, useContext } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "イベント一覧 - Aipictors"

  const metaDescription = "イベント一覧ページです。"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
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
      <Suspense fallback={<AppLoadingPage />}>
        {authContext.isLoggedIn && <EventsList appEvents={events.appEvents} />}
      </Suspense>
    </>
  )
}

export const appEventsQuery = graphql(
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
