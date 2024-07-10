import { Card, CardHeader } from "@/_components/ui/card"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { Link } from "@remix-run/react"

type Props = {
  title: string | null
  thumbnailImageUrl: string | null
  description: string | null
  startAt: number | null
  endAt: number | null
  slug: string | null
}

/**
 * イベントアイテム
 * @param props
 * @returns
 */
export const EventItem = (props: Props) => {
  if (
    !props.title ||
    !props.thumbnailImageUrl ||
    !props.description ||
    !props.startAt ||
    !props.endAt ||
    !props.slug
  )
    return null

  return (
    <Link to={`/events/${props.slug}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="m-auto">
              <img
                className="m-auto h-24 max-w-auto rounded-lg object-cover"
                src={props.thumbnailImageUrl}
                alt=""
              />
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
