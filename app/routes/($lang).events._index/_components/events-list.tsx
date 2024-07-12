import {
  type appEventItemFragment,
  EventItem,
} from "@/routes/($lang).events._index/_components/events-item"
import type { FragmentOf } from "gql.tada"

type Props = {
  appEvents: FragmentOf<typeof appEventItemFragment>[]
}

export const EventsList = (props: Props) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap items-center space-x-2 space-y-2 rounded-lg p-4 shadow-md">
        {props.appEvents.map((event) => (
          <div key={event.id}>
            <EventItem {...event} />
          </div>
        ))}
      </div>
    </div>
  )
}
