import type { Tag } from "~/components/tag/tag-input"
import { Checkbox } from "~/components/ui/checkbox"
import { Link } from "@remix-run/react"
import { useState } from "react"
import { Card, CardContent } from "~/components/ui/card"

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
export const PostFormItemEvent = (props: Props) => {
  const [isAttending, setIsAttending] = useState(props.isAttending ?? false)

  const handleAttendanceChange = (isChecked: boolean) => {
    setIsAttending(isChecked)
    if (props.eventTag) {
      if (isChecked) {
        props.addTag({
          id: "event",
          text: props.eventTag,
        })
        return
      }
      props.removeTag({
        id: "event",
        text: props.eventTag,
      })
    }
  }

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
              <h4 className="font-medium text-xs">{props.eventDescription}</h4>
            </CardContent>
          </Card>
        </Link>
      </CardContent>
    </Card>
  )
}
