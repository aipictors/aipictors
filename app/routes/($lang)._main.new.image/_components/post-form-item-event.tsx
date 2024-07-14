import type { Tag } from "@/_components/tag/tag-input"
import { Checkbox } from "@/_components/ui/checkbox"
import { Link } from "@remix-run/react"
import { useState } from "react"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  tags: Tag[]
  setTags: (value: Tag[]) => void
  eventName: string | null
  eventDescription: string | null
  eventTag: string | null
  endAt: number
  slug: string | null
}

/**
 * イベント入力
 */
export const PostFormItemEvent = (props: Props) => {
  const [isAttending, setIsAttending] = useState(false)

  const handleAttendanceChange = (isChecked: boolean) => {
    setIsAttending(isChecked)
    if (isChecked) {
      const newTags = [
        ...props.tags,
        { id: props.tags.length + 1, text: props.eventTag } as unknown as Tag,
      ]
      props.setTags(newTags)
    } else {
      const filteredTags = props.tags.filter(
        (tag) => tag.text !== props.eventTag,
      )
      props.setTags(filteredTags)
    }
  }

  // Unix Timestamp を日時に変換する関数
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
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
          {/* TODO: 参加するボタンを何度も押したらタグが無限に複数追加されるので直す */}
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
