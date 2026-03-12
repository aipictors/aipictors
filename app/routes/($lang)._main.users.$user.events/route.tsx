import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Card, CardContent } from "~/components/ui/card"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  AppEventCard,
  type EventCardItem,
} from "~/routes/($lang).events._index/components/app-event-card"

const normalizeUserEvent = (event: any): EventCardItem => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  description: event.description,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  startAt: event.startAt,
  endAt: event.endAt,
  tags: [event.mainTag, ...(event.tags ?? [])].filter(Boolean),
  status: event.status,
  isOfficial: false,
  rankingEnabled: event.rankingEnabled,
  entryCount: event.entryCount,
  participantCount: event.participantCount,
  userId: event.userId,
  userName: event.userName,
  userIconUrl: event.userIconUrl,
})

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.user === undefined) {
    throw new Response(null, { status: 404 })
  }

  const result = await loaderClient.query({
    query: userEventsQuery,
    variables: {
      userId: decodeURIComponent(props.params.user),
      limit: 50,
      offset: 0,
      where: {
        sort: "ONGOING_FIRST",
      },
    },
  })

  if (result.data.user === null) {
    throw new Response(null, { status: 404 })
  }

  return {
    events: result.data.user.userEvents.map(normalizeUserEvent),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export default function UserEventsRoute() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()

  if (data.events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {t(
            "このユーザーはまだ公開イベントを開催していません。",
            "This user has not hosted any public events yet.",
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.events.map((event) => (
        <AppEventCard key={event.id} appEvent={event} />
      ))}
    </div>
  )
}

const userEventsQuery = graphql(
  `query UserHostedEvents($userId: ID!, $limit: Int!, $offset: Int!, $where: UserEventsWhereInput) {
    user(id: $userId) {
      id
      userEvents(limit: $limit, offset: $offset, where: $where) {
        id
        slug
        title
        description
        headerImageUrl
        thumbnailImageUrl
        mainTag
        tags
        status
        startAt
        endAt
        rankingEnabled
        entryCount
        participantCount
        userId
        userName
        userIconUrl
      }
    }
  }`,
)