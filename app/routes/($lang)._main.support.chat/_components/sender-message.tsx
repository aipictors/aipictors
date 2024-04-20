import { Card } from "@/_components/ui/card"
import { toElapsedTimeText } from "@/_utils/to-elapsed-time-text"

type Props = {
  text: string
  createdAt: number
  isRead: boolean
}

export const SenderMessage = (props: Props) => {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-sm flex-col gap-y-2">
        <Card
          className={
            "rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl px-6 py-2"
          }
        >
          <p className="overflow-hidden whitespace-pre-wrap break-words">
            {props.text}
          </p>
        </Card>
        <div className="flex justify-end space-x-2">
          <span className="text-xs">{props.isRead ? "既読" : ""}</span>
          <p className="text-xs">{toElapsedTimeText(props.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
