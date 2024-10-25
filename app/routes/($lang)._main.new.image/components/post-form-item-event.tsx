import type { Tag } from "~/components/tag/tag-input"
import { Checkbox } from "~/components/ui/checkbox"
import { Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "~/components/ui/card"
import { getJstDate } from "~/utils/jst-date"

type Props = {
  eventName: string | null
  eventDescription: string | null
  eventTag: string | null
  endAt: number
  slug: string | null
  removeTag: (tag: Tag) => void
  addTag: (tag: Tag) => void
  isAttending?: boolean
}

/**
 * イベント入力
 */
export function PostFormItemEvent(props: Props) {
  const now = getJstDate(new Date())

  const isOngoing = now <= new Date(props.endAt * 1000)

  if (!isOngoing) {
    return null
  }

  const [isAttending, setIsAttending] = useState(
    props.isAttending === undefined ? false : props.isAttending,
  )

  const handleAttendanceChange = (isChecked: boolean) => {
    setIsAttending(isChecked)
    if (props.eventTag) {
      if (isChecked) {
        props.addTag({
          id: props.eventTag,
          text: props.eventTag,
        })
        return
      }
      props.removeTag({
        id: props.eventTag,
        text: props.eventTag,
      })
    }
  }

  useEffect(() => {
    setIsAttending(props.isAttending === undefined ? false : props.isAttending)
  }, [props.isAttending])

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{"イベント"}</p>
        <div className="flex items-center">
          <Checkbox
            checked={isAttending}
            onCheckedChange={handleAttendanceChange}
            id="attend-checkbox"
          />
          <label htmlFor="attend-checkbox" className="ml-2 font-medium text-sm">
            参加する
          </label>
        </div>
        {/* イベント名と説明を表示 */}
        <Link
          className="block"
          to={`https://www.aipictors.com/events/${props.slug}`}
          target="_blank"
        >
          <Card>
            <CardContent className="space-y-2 p-4">
              <h3 className="font-medium text-sm">{props.eventName}</h3>
              {props.eventDescription !== null && (
                <div
                  className="font-medium text-xs"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{ __html: props.eventDescription }}
                />
              )}
            </CardContent>
          </Card>
        </Link>
      </CardContent>
    </Card>
  )
}
