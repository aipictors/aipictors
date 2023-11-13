"use client"

import { toElapsedTimeText } from "@/app/_utils/to-elapsed-time-text"
import { Card } from "@/components/ui/card"

type Props = {
  text: string
  createdAt: number
  isRead: boolean
}

export const SenderMessage: React.FC<Props> = (props) => {
  // const bg = useColorModeValue("teal.200", "teal.600")

  return (
    <div className="flex justify-end">
      <div className="max-w-sm">
        <Card
          className={
            "px-6 py-2 rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl"
          }
        >
          <p className="whitespace-pre-wrap">{props.text}</p>
        </Card>
        <div className="flex justify-end">
          <p className="text-2xs">{props.isRead ? "既読" : ""}</p>
        </div>
        <div className="flex justify-end">
          <p className="text-2xs">{toElapsedTimeText(props.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
