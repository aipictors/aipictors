import { Link } from "@remix-run/react"
import { useEffect, useState } from "react"
import type { Tag } from "~/components/tag/tag-input"
import { Card, CardContent } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { getJstDate } from "~/utils/jst-date"

type Props = {
  eventName: string | null
  eventDescription: string | null
  thumbnailImageUrl?: string | null
  eventTag: string | null
  ratings?: ("G" | "R15" | "R18" | "R18G")[] | null
  startAt: number
  endAt: number
  publishAtUnixSeconds?: number
  slug: string | null
  removeTag: (tag: Tag) => void
  addTag: (tag: Tag) => void
  isAttending?: boolean
}

const formatEventDateTime = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

/**
 * イベント入力
 */
export function PostFormItemEvent(props: Props) {
  const now = getJstDate(new Date())
  const checkboxId = `attend-checkbox-${props.slug ?? props.eventTag ?? "event"}`
  const thumbnailSrc = props.thumbnailImageUrl || "/images/opepnepe.png"

  const publishAtUnixSeconds =
    props.publishAtUnixSeconds ?? Math.floor(now.getTime() / 1000)
  const isBeforeStart = publishAtUnixSeconds < props.startAt
  const isEnded = publishAtUnixSeconds > props.endAt
  const isSelectable = !isBeforeStart && !isEnded

  const [isAttending, setIsAttending] = useState(
    props.isAttending === undefined ? false : props.isAttending,
  )

  const handleAttendanceChange = (isChecked: boolean) => {
    if (isChecked && !isSelectable) {
      return
    }

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

  useEffect(() => {
    if (isSelectable || !isAttending || !props.eventTag) {
      return
    }

    props.removeTag({
      id: props.eventTag,
      text: props.eventTag,
    })
  }, [isAttending, isSelectable, props.eventTag, props.removeTag])

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center">
          <Checkbox
            checked={isAttending}
            onCheckedChange={handleAttendanceChange}
            disabled={!isSelectable}
            id={checkboxId}
          />
          <label htmlFor={checkboxId} className="ml-2 font-medium text-sm">
            参加する
          </label>
        </div>
        <div className="rounded-md bg-muted/40 px-3 py-2 text-xs">
          <div className="font-medium">開催期間</div>
          <div className="mt-1">
            {formatEventDateTime(props.startAt)} ～ {formatEventDateTime(props.endAt)}
          </div>
        </div>
        {isBeforeStart && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 text-xs">
            <div>このイベントはまだ開始されていません。</div>
            <div>開始後に投稿可能になります。</div>
          </div>
        )}
        {isEnded && (
          <div className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800 text-xs">
            このイベントは終了しています。
          </div>
        )}
        {/* イベント名と説明を表示 */}
        <Link
          className="block"
          to={`https://www.aipictors.com/events/${props.slug}`}
          target="_blank"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <img
                  src={thumbnailSrc}
                  alt={props.eventName ?? ""}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 space-y-2">
                  <h3 className="font-medium text-sm">{props.eventName}</h3>
                  {props.ratings && props.ratings.length > 0 && (
                    <div className="text-muted-foreground text-xs">
                      対象年齢: {props.ratings.join(", ")}
                    </div>
                  )}
                  {props.eventDescription !== null && (
                    <div
                      className="line-clamp-3 font-medium text-xs"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: eventDescription is pre-formatted HTML content
                      dangerouslySetInnerHTML={{ __html: props.eventDescription }}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </CardContent>
    </Card>
  )
}
