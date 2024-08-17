import {
  type appEventItemFragment,
  EventItem,
} from "~/routes/($lang).events._index/components/events-item"
import type { FragmentOf } from "gql.tada"

type Props = {
  appEvents: FragmentOf<typeof appEventItemFragment>[]
}

export const EventsList = (props: Props) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="grid gap-2 rounded-lg p-4 md:grid-cols-2 xl:grid-cols-3">
        {props.appEvents.map((event) => (
          <div key={event.id}>
            <EventItem {...event} />
          </div>
        ))}
      </div>
    </div>
  )
}
