import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { createClient } from "@/_lib/client"
import { EventPage } from "@/routes/($lang).events.$event._index/_components/event-page"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Suspense, useContext } from "react"

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
  const authContext = useContext(AuthContext)
  const events = useLoaderData<typeof loader>()

  return (
    <>
      <Suspense fallback={<AppLoadingPage />}>
        {authContext.isLoggedIn && (
          <EventPage
            appEvent={events.appEvent}
            works={events.works}
            worksCount={events.worksCount}
            page={events.page}
          />
        )}
      </Suspense>
    </>
  )
}

export const appEventQuery = graphql(
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

export const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
