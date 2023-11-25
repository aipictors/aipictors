import { toElapsedTimeText } from "@/app/_utils/to-elapsed-time-text"
import { Card } from "@/components/ui/card"

type Props = {
  text: string
  createdAt: number
  isRead: boolean
}

export const SenderMessage = (props: Props) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-sm flex flex-col gap-y-2">
        <Card
          className={
            "px-6 py-2 rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl"
          }
        >
          <p className="whitespace-pre-wrap overflow-hidden break-words">
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
