import type { Tag } from "@/_components/tag/tag-input"
import { Checkbox } from "@/_components/ui/checkbox"
import { Link } from "@remix-run/react"
import { useState } from "react"

type Props = {
  tags: Tag[]
  setTags: (value: Tag[]) => void
  eventName: string
  eventDescription: string
  eventTag: string
  endAt: number
  slug: string
}

/**
 * イベント入力
 */
export const EventInput = (props: Props) => {
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
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-background pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 font-bold text-sm">{"イベント"}</p>
          <div className="items-center">
            <Checkbox
              checked={isAttending}
              onCheckedChange={handleAttendanceChange}
              id="attend-checkbox"
            />
            <label
              htmlFor="attend-checkbox"
              className="ml-2 font-medium text-sm"
            >
              参加する
            </label>
          </div>
          {/* イベント名と説明を表示 */}
          <Link
            to={`https://www.aipictors.com/events/${props.slug}`}
            className="mt-2"
          >
            <h3 className="font-medium text-sm">{props.eventName}</h3>
            {/* <p className="text-gray-600 text-sm">{props.eventDescription}</p> */}
          </Link>
          {/* 終了日時を表示 */}
          {/* {props.endAt !== 0 && (
            <p className="text-gray-500 text-sm">
              終了日時: {formatDate(props.endAt)}
            </p>
          )} */}
        </div>
      </div>
    </>
  )
}
