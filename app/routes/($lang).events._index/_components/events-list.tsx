import { EventItem } from "@/routes/($lang).events._index/_components/events-item"
import { graphql, type ResultOf } from "gql.tada"

type Props = {
  appEvents: ResultOf<typeof appEventsQuery>["appEvents"]
}

export const EventsList = (props: Props) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap items-center space-x-2 space-y-2 rounded-lg p-4 shadow-md">
        {props.appEvents.map((event) => (
          <div key={event.id}>
            <EventItem
              title={event.title}
              thumbnailImageUrl={event.thumbnailImageUrl}
              description={event.description}
              startAt={event.startAt}
              endAt={event.endAt}
              slug={event.slug}
            />
          </div>
        ))}
      </div>
    </div>
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
