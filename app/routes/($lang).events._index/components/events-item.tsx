import { Card, CardHeader } from "~/components/ui/card"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { getJstDate } from "~/utils/jst-date"

type Props = FragmentOf<typeof appEventItemFragment>

/**
 * イベントアイテム
 * @param props
 * @returns
 */
export function EventItem(props: Props) {
  if (
    !props.title ||
    !props.thumbnailImageUrl ||
    !props.description ||
    !props.startAt ||
    !props.endAt ||
    !props.slug
  ) {
    return null
  }

  const now = getJstDate(new Date())
  const isOngoing =
    new Date(props.startAt * 1000) <= now && now <= new Date(props.endAt * 1000)

  return (
    <Link className="w-full" to={`/events/${props.slug}`}>
      <Card className="w-full">
        <CardHeader className="w-full">
          <div className="relative flex items-center">
            <div className="m-auto">
              <img
                className="m-auto h-24 max-w-auto rounded-lg object-cover"
                src={props.thumbnailImageUrl}
                alt=""
              />
              {isOngoing && (
                <div className="absolute top-0 left-0 rounded-br-lg bg-red-500 px-2 py-1 font-bold text-white text-xs">
                  開催中
                </div>
              )}
            </div>
          </div>
          <div className="font-medium text-sm">{props.title}</div>
          <div className="text-sm">
            {toDateTimeText(props.startAt)}～{toDateTimeText(props.endAt)}
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

export const appEventItemFragment = graphql(
  `fragment AppEventItem on AppEventNode @_unmask {
    id
    description
    title
    slug
    thumbnailImageUrl
    headerImageUrl
    startAt
    endAt
    tag
  }`,
)
