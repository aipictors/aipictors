import { Card, CardHeader } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { getJstDate } from "~/utils/jst-date"
import { useEventDateTimeText } from "~/routes/($lang).events._index/hooks/use-event-date-time-text"

type Props = {
  appEvent: FragmentOf<typeof AppEventItemFragment>
}

/**
 * イベントアイテム
 */
export function AppEventCard (props: Props) {
  const appEvent = readFragment(AppEventItemFragment, props.appEvent)

  const now = getJstDate(new Date())

  const isOngoing =
    new Date(appEvent.startAt * 1000) <= now &&
    now <= new Date(appEvent.endAt * 1000)

  const startAt = useEventDateTimeText(appEvent.startAt)

  const endAt = useEventDateTimeText(appEvent.endAt)

  return (
    <Link className="w-full" to={`/events/${appEvent.slug}`}>
      <Card className="h-full w-full">
        <CardHeader className="w-full">
          <div className="relative flex items-center">
            <div className="m-auto">
              <img
                className="m-auto h-24 max-w-auto rounded-lg object-cover"
                src={appEvent.thumbnailImageUrl}
                alt=""
              />
              {isOngoing && (
                <div className="absolute top-0 left-0 rounded-br-lg bg-red-500 px-2 py-1 font-bold text-white text-xs">
                  開催中
                </div>
              )}
            </div>
          </div>
          <div className="font-medium text-sm">{appEvent.title}</div>
          <div className="text-sm">
            {startAt}～{endAt}
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

export const AppEventItemFragment = graphql(
  `fragment AppEventItemFragment on AppEventNode {
    id
    description
    title
    slug
    thumbnailImageUrl
    startAt
    endAt
  }`,
)
